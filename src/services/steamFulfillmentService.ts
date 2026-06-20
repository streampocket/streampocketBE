import { FulfillmentStatus, SteamProduct, Store } from '@prisma/client'
import { discordNotifier } from '../lib/discord'
import {
  createOrderItem,
  findOrderById,
  findOrderByProductOrderId,
  listOrdersPaidBetween,
  updateOrderItem,
} from '../repositories/steamOrderRepository'
import { fetchProductOrderDetails } from './platform/naverOrderSource'
import { findProductByNaverId } from '../repositories/steamProductRepository'
import { findListingWithGameByNaverProductId } from '../repositories/storeListingRepository'
import {
  reserveNextAvailableAccount,
  reserveNextAvailableAccountByGame,
  countAvailableAccounts,
  countAvailableAccountsByGame,
  markAccountAsSent,
} from '../repositories/steamAccountRepository'
import { detectProductType } from '../utils/productType'
import { DEFAULT_STORE, STORE_LABELS } from '../constants/stores'
import { IOrderSource, IncomingOrderItem } from './platform/IOrderSource'
import { isAlimtalkEnabled, sendOrderAlimtalk, sendOutOfStockAlimtalk } from './alimtalkService'

const LOW_STOCK_THRESHOLD = Number(process.env['LOW_STOCK_THRESHOLD'] ?? 2)

let isPollingInProgress = false

export type OrderPollingTrigger = 'startup' | 'interval' | 'manual' | 'backup-scan'

export type OrderSource = 'main' | 'backup'

export type OrderPollingResult = {
  fetchedCount: number
  processedCount: number
  failedCount: number
  returnedCount: number
  decidedCount: number
  recoveredCount: number
  skipped: boolean
}

const ACTIVE_PRODUCT_ORDER_STATUSES = [
  'PAYED',
  'DISPATCHED',
  'DELIVERED',
  'PURCHASE_DECIDED',
]

// 클레임이 확정 종료된 네이버 주문 최종 상태 — 이 상태면 복구 금지(취소/반품 확정)
const FINAL_CLAIMED_PRODUCT_ORDER_STATUSES = ['CANCELED', 'RETURNED']

// 활성 클레임 판정에 쓰는 클레임 타입 — 이 타입이 살아있으면 복구를 막는다.
const CLAIM_TYPES_BLOCKING_RECOVERY = ['CANCEL', 'RETURN']

// 거부/철회로 종결된 claimStatus(claimType이 유지되더라도 해소로 간주). 실값 확인 시 보조 추가 — 비어도 동작.
const RESOLVED_CLAIM_STATUSES: string[] = []

// 복구 판정 입력 — 네이버 권위 데이터(상세 /query) 스냅샷
export type ClaimSnapshot = {
  productOrderStatus: string | null
  claimType: string | null
  claimStatus: string | null
}

export type RecoveryDecision = { recover: false } | { recover: true; status: RecoveredStatus }

/**
 * 진행 중인 취소/반품 클레임이 있는지 판정 (복구를 막아야 하는지).
 * claimStatus enum 불일치/누락에 영향받지 않도록 claimType을 1차 기준으로 사용한다.
 */
export function hasActiveCancelOrReturnClaim(snapshot: ClaimSnapshot): boolean {
  // 이미 취소/반품 확정 — 활성 클레임 아님(복구도 어차피 ACTIVE 아님)
  if (
    snapshot.productOrderStatus !== null &&
    FINAL_CLAIMED_PRODUCT_ORDER_STATUSES.includes(snapshot.productOrderStatus)
  ) {
    return false
  }
  // 거부/철회로 종결된 claimStatus — 해소로 간주
  if (snapshot.claimStatus !== null && RESOLVED_CLAIM_STATUSES.includes(snapshot.claimStatus)) {
    return false
  }
  // claimType이 살아있으면 진행 중으로 간주 (claimStatus 값에 의존하지 않음)
  return snapshot.claimType !== null && CLAIM_TYPES_BLOCKING_RECOVERY.includes(snapshot.claimType)
}

/**
 * returned 주문을 정상 상태로 복구할지/어떤 상태로 복구할지 판정 (순수 함수).
 * - productOrderStatus가 ACTIVE이고 활성 취소/반품 클레임이 없을 때만 복구.
 * - 진행 중 취소(PAYED 유지) → 복구 안 함 → 대기↔취소처리 토글 차단.
 */
export function evaluateReturnedRecovery(
  snapshot: ClaimSnapshot,
  completedAt: Date | null,
): RecoveryDecision {
  if (snapshot.productOrderStatus === null) return { recover: false }
  if (!ACTIVE_PRODUCT_ORDER_STATUSES.includes(snapshot.productOrderStatus)) return { recover: false }
  if (hasActiveCancelOrReturnClaim(snapshot)) return { recover: false }
  return { recover: true, status: resolveRecoveredStatus(snapshot.productOrderStatus, completedAt) }
}

// 클레임 종료 복귀 시 복원할 상태 — 네이버 상태 + DB 발송완료 기록 기준 (자동·수동 복귀 공통).
// '완료' 판정은 네이버 배송완료(DELIVERED)가 아닌 completedAt 기준 — NA 주문은 발송 직후
// 네이버가 자동 배송완료되므로 네이버 기준을 쓰면 원래 '대기'였던 주문이 '완료'로 오판된다.
type RecoveredStatus = 'pending' | 'completed' | 'purchase_decided'

const RECOVERED_STATUS_LABELS: Record<RecoveredStatus, string> = {
  pending: '대기',
  completed: '완료',
  purchase_decided: '구매확정',
}

export function resolveRecoveredStatus(
  naverProductOrderStatus: string | null | undefined,
  completedAt: Date | null,
): RecoveredStatus {
  if (naverProductOrderStatus === 'PURCHASE_DECIDED') return 'purchase_decided'
  if (completedAt) return 'completed'
  return 'pending'
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function formatOrderPriceLines(unitPrice: number, product: SteamProduct | null): string[] {
  const fmt = (n: number): string => `${n.toLocaleString('ko-KR')}원`

  if (!product) {
    return [`금액: ${fmt(unitPrice)}`]
  }

  const regular = product.price ?? unitPrice
  const pc = product.discountPricePc
  const mobile = product.discountPriceMobile

  // 할인 미설정
  if (pc == null && mobile == null) {
    return [`금액(정가): ${fmt(regular)}`]
  }

  // PC/모바일 동일 할인
  if (pc != null && mobile != null && pc === mobile) {
    return [`금액(정가): ${fmt(regular)}`, `할인가: ${fmt(pc)}`]
  }

  // PC/모바일 다른 할인 (한쪽만 설정된 경우 포함)
  const lines = [`금액(정가): ${fmt(regular)}`]
  if (pc != null) lines.push(`할인가(PC): ${fmt(pc)}`)
  if (mobile != null) lines.push(`할인가(모바일): ${fmt(mobile)}`)
  return lines
}

export async function processOrder(
  item: IncomingOrderItem,
  orderSource: IOrderSource,
  source: OrderSource = 'main',
  store: Store = DEFAULT_STORE,
): Promise<void> {
  const notify = discordNotifier(store)
  const existing = await findOrderByProductOrderId(item.productOrderId)
  if (existing) return

  // 게임 해석 — 리스팅이 있으면 gameId·productType 을 게임 기반으로 확보.
  // store 는 폴링 계정(파라미터)이 권위값(미동기화 상품도 올바른 store).
  // product(레거시 steam_products)는 스트림포켓 폴백용 — 포켓은 없을 수 있음.
  const listing = await findListingWithGameByNaverProductId(item.naverProductId)
  const product = await findProductByNaverId(item.naverProductId)
  const gameId = listing?.gameId ?? null

  const sourceTag = source === 'backup' ? ' (보조 스캔으로 사후 포착)' : ''
  const priceLines = formatOrderPriceLines(item.unitPrice, product).join('\n')
  await notify(
    'order',
    `🔔 신규 주문 감지${sourceTag}\n상품: ${item.productName}\n${priceLines}\n수신자: ${item.receiverName ?? '-'}\n주문: ${item.productOrderId}`,
  )

  const orderItem = await createOrderItem({
    productOrderId: item.productOrderId,
    naverOrderId: item.externalOrderId,
    productName: item.productName,
    unitPrice: item.unitPrice,
    paymentAmount: item.paymentAmount,
    receiverPhoneNumber: item.receiverPhoneNumber ?? undefined,
    receiverName: item.receiverName ?? undefined,
    store,
    gameId,
    paidAt: item.paidAt,
  })

  if (!item.receiverPhoneNumber) {
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'manual_review',
      errorMessage: '구매자 연락처 조회 실패',
    })
    await notify(
      'error',
      `⚠️ 구매자 연락처 조회 실패 및 수동 처리 필요\n주문: ${item.productOrderId}\n상품: ${item.productName}`,
    )
    return
  }

  if (!listing && !product) {
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'manual_review',
      errorMessage: `네이버 상품 ID(${item.naverProductId})와 매핑되는 상품 없음 (동기화 필요)`,
    })
    await notify(
      'error',
      `⚠️ 상품 매핑 실패 및 수동 처리 필요\n주문: ${item.productOrderId}\n네이버 상품 ID: ${item.naverProductId}`,
    )
    return
  }

  // 레거시 브리지 호환 — steam_products 가 있을 때만 productId 연결(포켓은 없음).
  if (product) {
    await updateOrderItem(orderItem.id, { productId: product.id })
  }

  // 타입은 게임(productType) 우선, 리스팅 없으면 상품명 파싱으로 폴백(기존 동작).
  const productType = listing?.game.productType ?? (product ? detectProductType(product.name) : null)
  if (productType === null) {
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'manual_review',
      errorMessage: '상품 타입(NA/AA) 미감지',
    })
    await notify(
      'error',
      `⚠️ 상품 타입 미감지\n상품: ${item.productName}\n주문번호: ${item.productOrderId}`,
    )
    return
  }

  if (productType === 'BG') {
    // 발주확인만 수행(네이버: 상품준비중 유지) — 발송처리(dispatch)는 관리자 진행중 전환/완료 시점에 수행
    try {
      await orderSource.confirmOrder(item.productOrderId)
    } catch (error) {
      const message = toErrorMessage(error)
      await updateOrderItem(orderItem.id, {
        fulfillmentStatus: 'failed',
        errorMessage: `발주 확인 실패: ${message}`,
      })
      await notify(
        'error',
        `❌ 발주 확인 실패\n주문: ${item.productOrderId}\n오류: ${message}`,
      )
      return
    }

    try {
      const alimtalkEnabled = await isAlimtalkEnabled(store)
      if (!alimtalkEnabled) {
        await updateOrderItem(orderItem.id, {
          fulfillmentStatus: 'manual_review',
          errorMessage: '알림톡 발송이 비활성화되어 수동 처리로 전환됨',
        })
        await notify(
          'error',
          `⚠️ 알림톡 발송 비활성화 및 수동 처리 필요\n주문: ${item.productOrderId}\n수신번호: ${item.receiverPhoneNumber}`,
        )
        return
      }

      await sendOrderAlimtalk({
        productType: 'BG',
        orderItemId: orderItem.id,
        recipientPhoneNumber: item.receiverPhoneNumber,
        recipientName: item.receiverName,
        productName: item.productName,
        paidAt: item.paidAt,
      }, store)

      await updateOrderItem(orderItem.id, { fulfillmentStatus: 'pending' })
      await notify(
        'order',
        `🎮 BG 코드 주문\n상품: ${item.productName}\n주문번호: ${item.productOrderId}\n알림톡: ✅ 발송 성공`,
      )
    } catch (error) {
      const message = toErrorMessage(error)
      await updateOrderItem(orderItem.id, {
        fulfillmentStatus: 'manual_review',
        errorMessage: `알림톡 발송 실패: ${message}`,
      })
      await notify(
        'error',
        `🎮 BG 코드 주문 — 알림톡 발송 실패\n상품: ${item.productName}\n주문번호: ${item.productOrderId}\n알림톡: ❌ ${message}`,
      )
    }
    return
  }

  if (productType === 'AA') {
    // 발주확인만 수행(네이버: 상품준비중 유지) — 발송처리(dispatch)는 관리자 진행중 전환/완료 시점에 수행
    try {
      await orderSource.confirmOrder(item.productOrderId)
    } catch (error) {
      const message = toErrorMessage(error)
      await updateOrderItem(orderItem.id, {
        fulfillmentStatus: 'failed',
        errorMessage: `발주 확인 실패: ${message}`,
      })
      await notify(
        'error',
        `❌ 발주 확인 실패\n주문: ${item.productOrderId}\n오류: ${message}`,
      )
      return
    }

    try {
      const alimtalkEnabled = await isAlimtalkEnabled(store)
      if (!alimtalkEnabled) {
        await updateOrderItem(orderItem.id, {
          fulfillmentStatus: 'manual_review',
          errorMessage: '알림톡 발송이 비활성화되어 수동 처리로 전환됨',
        })
        await notify(
          'error',
          `⚠️ 알림톡 발송 비활성화 및 수동 처리 필요\n주문: ${item.productOrderId}\n수신번호: ${item.receiverPhoneNumber}`,
        )
        return
      }

      await sendOrderAlimtalk({
        productType: 'AA',
        orderItemId: orderItem.id,
        recipientPhoneNumber: item.receiverPhoneNumber,
        recipientName: item.receiverName,
        productName: item.productName,
        paidAt: item.paidAt,
      }, store)

      await updateOrderItem(orderItem.id, { fulfillmentStatus: 'pending' })
      await notify(
        'order',
        `🛒 AA 계정 주문\n상품: ${item.productName}\n주문번호: ${item.productOrderId}\n알림톡: ✅ 발송 성공`,
      )
    } catch (error) {
      const message = toErrorMessage(error)
      await updateOrderItem(orderItem.id, {
        fulfillmentStatus: 'manual_review',
        errorMessage: `알림톡 발송 실패: ${message}`,
      })
      await notify(
        'error',
        `🛒 AA 계정 주문 — 알림톡 발송 실패\n상품: ${item.productName}\n주문번호: ${item.productOrderId}\n알림톡: ❌ ${message}`,
      )
    }
    return
  }

  // NA 재고는 게임 단위 공유 → gameId 우선, 없으면 레거시 productId 폴백.
  const account = gameId
    ? await reserveNextAvailableAccountByGame(gameId)
    : product
      ? await reserveNextAvailableAccount(product.id)
      : null
  if (!account) {
    // 발주확인만 수행(네이버: 상품준비중 유지) — 발송처리(dispatch)는 관리자 진행중 전환/완료 시점에 수행
    try {
      await orderSource.confirmOrder(item.productOrderId)
    } catch (error) {
      const message = toErrorMessage(error)
      await updateOrderItem(orderItem.id, {
        fulfillmentStatus: 'failed',
        errorMessage: `발주 확인 실패: ${message}`,
      })
      await notify(
        'error',
        `❌ 발주 확인 실패\n주문: ${item.productOrderId}\n오류: ${message}`,
      )
      return
    }

    try {
      const alimtalkEnabled = await isAlimtalkEnabled(store)
      if (!alimtalkEnabled) {
        await updateOrderItem(orderItem.id, {
          fulfillmentStatus: 'manual_review',
          errorMessage: '알림톡 발송이 비활성화되어 수동 처리로 전환됨',
        })
        await notify(
          'error',
          `⚠️ 알림톡 발송 비활성화 및 수동 처리 필요\n주문: ${item.productOrderId}\n수신번호: ${item.receiverPhoneNumber}`,
        )
        return
      }

      await sendOutOfStockAlimtalk({
        orderItemId: orderItem.id,
        recipientPhoneNumber: item.receiverPhoneNumber,
        recipientName: item.receiverName,
      }, store)
    } catch (error) {
      const message = toErrorMessage(error)
      await updateOrderItem(orderItem.id, {
        fulfillmentStatus: 'manual_review',
        errorMessage: `재고없음 안내 알림톡 발송 실패: ${message}`,
      })
      await notify(
        'error',
        `❌ 재고없음 안내 알림톡 발송 실패 및 수동 개입 필요\n주문: ${item.productOrderId}\n수신번호: ${item.receiverPhoneNumber}`,
      )
      return
    }

    await updateOrderItem(orderItem.id, { fulfillmentStatus: 'pending' })

    await notify(
      'stock',
      `🚨 재고 부족 — 안내 알림톡 발송 완료. 카톡 응대 + 코드 수동 발송 필요\n상품: ${item.productName}\n주문: ${item.productOrderId}\n수신번호: ${item.receiverPhoneNumber}`,
    )
    return
  }

  await updateOrderItem(orderItem.id, { accountId: account.id })

  const remaining = gameId
    ? await countAvailableAccountsByGame(gameId)
    : product
      ? await countAvailableAccounts(product.id)
      : 0
  if (remaining <= LOW_STOCK_THRESHOLD) {
    await notify(
      'stock',
      `⚠️ 재고 부족 경고\n상품: ${item.productName}\n남은 코드: ${remaining}개`,
    )
  }

  try {
    await orderSource.confirmOrder(item.productOrderId)
  } catch (error) {
    const message = toErrorMessage(error)
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'failed',
      errorMessage: `발주 확인 실패: ${message}`,
    })
    await notify(
      'error',
      `❌ 발주 확인 실패\n주문: ${item.productOrderId}\n오류: ${message}`,
    )
    return
  }

  try {
    await orderSource.dispatchOrder(item.productOrderId)
  } catch (error) {
    const message = toErrorMessage(error)
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'failed',
      errorMessage: `발송 처리 실패: ${message}`,
    })
    await notify(
      'error',
      `❌ 발송 처리 실패\n주문: ${item.productOrderId}\n오류: ${message}`,
    )
    return
  }

  await updateOrderItem(orderItem.id, { naverDispatchedAt: new Date() })

  await notify(
    'order',
    `✅ 주문 처리 완료 (네이버)\n상품: ${item.productName}\n주문번호: ${item.productOrderId}`,
  )

  try {
    const alimtalkEnabled = await isAlimtalkEnabled(store)
    if (!alimtalkEnabled) {
      await updateOrderItem(orderItem.id, {
        fulfillmentStatus: 'manual_review',
        errorMessage: '알림톡 발송이 비활성화되어 수동 처리로 전환됨',
      })
      await notify(
        'error',
        `⚠️ 알림톡 발송 비활성화 및 수동 처리 필요\n주문: ${item.productOrderId}\n수신번호: ${item.receiverPhoneNumber}`,
      )
      return
    }

    await sendOrderAlimtalk({
      productType: 'NA',
      orderItemId: orderItem.id,
      recipientPhoneNumber: item.receiverPhoneNumber,
      recipientName: item.receiverName,
      productName: item.productName,
      accountUsername: account.username,
      accountPassword: account.password,
      accountEmail: account.email,
      accountEmailPassword: account.emailPassword,
      accountEmailSiteUrl: account.emailSiteUrl,
      accountSecondaryEmail: account.secondaryEmail,
      accountSecondaryEmailPassword: account.secondaryEmailPassword,
      accountSecondaryEmailSiteUrl: account.secondaryEmailSiteUrl,
      paidAt: item.paidAt,
    }, store)
  } catch (error) {
    const message = toErrorMessage(error)
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'manual_review',
      errorMessage: `알림톡 발송 실패: ${message}`,
    })
    await notify(
      'error',
      `❌ 알림톡 발송 실패 및 수동 개입 필요\n주문: ${item.productOrderId}\n수신번호: ${item.receiverPhoneNumber}`,
    )
    return
  }

  await markAccountAsSent(account.id)
  await updateOrderItem(orderItem.id, { fulfillmentStatus: 'pending' })

  await notify(
    'order',
    `✅ 알림톡 발송 성공\n주문: ${item.productOrderId}\n수신번호: ${item.receiverPhoneNumber}`,
  )
}

export async function processReturnedOrders(
  orderSource: IOrderSource,
  store: Store = DEFAULT_STORE,
): Promise<number> {
  const notify = discordNotifier(store)
  const returnedItems = await orderSource.fetchReturnedOrders()
  let returnedCount = 0

  for (const item of returnedItems) {
    try {
      // 취소(CANCEL) 클레임도 returned로 통합 처리 — 매출 제외·작업 중단 목적은 동일. 구분은 errorMessage에 기록.
      const isCancel = item.claimType === 'CANCEL'
      const claimLabel = isCancel ? '취소요청' : '반품'
      const existing = await findOrderByProductOrderId(item.productOrderId)

      if (!existing) {
        const created = await createOrderItem({
          productOrderId: item.productOrderId,
          naverOrderId: item.externalOrderId,
          productName: item.productName,
          unitPrice: item.unitPrice,
          receiverPhoneNumber: item.receiverPhoneNumber ?? undefined,
          receiverName: item.receiverName ?? undefined,
          store,
          paidAt: item.paidAt,
        })
        await updateOrderItem(created.id, {
          fulfillmentStatus: 'returned',
          returnedAt: new Date(),
          errorMessage: `${claimLabel} 클레임 감지 (${item.claimType}/${item.claimStatus})`,
        })
        returnedCount += 1

        await notify(
          'order',
          `🔁 사후 포착된 ${claimLabel} 주문 (PAYED 지연으로 신규 알림 미발송)\n주문: ${item.productOrderId}\n상품: ${item.productName}\n수신자: ${item.receiverName ?? '-'}\n클레임 상태: ${item.claimStatus}`,
        )
        continue
      }

      if (existing.fulfillmentStatus === 'returned') continue

      await updateOrderItem(existing.id, {
        fulfillmentStatus: 'returned',
        returnedAt: new Date(),
        errorMessage: `${claimLabel} 클레임 감지 (${item.claimType}/${item.claimStatus})`,
      })
      returnedCount += 1

      await notify(
        'order',
        isCancel
          ? `🛑 취소요청 감지 — 작업 중단 필요\n주문: ${item.productOrderId}\n상품: ${existing.productName}\n클레임 상태: ${item.claimStatus}`
          : `📦 반품 감지\n주문: ${item.productOrderId}\n상품: ${existing.productName}\n클레임 상태: ${item.claimStatus}`,
      )
    } catch (error) {
      const message = toErrorMessage(error)
      await notify(
        'error',
        `❌ 반품 처리 중 예외 발생\n주문: ${item.productOrderId}\n오류: ${message}`,
      )
    }
  }

  return returnedCount
}

export async function processPurchaseDecidedOrders(orderSource: IOrderSource): Promise<number> {
  const decidedItems = await orderSource.fetchPurchaseDecidedOrders()
  let decidedCount = 0

  for (const item of decidedItems) {
    try {
      const existing = await findOrderByProductOrderId(item.productOrderId)
      if (!existing || existing.decisionDate) continue

      const shouldTransitionStatus =
        existing.fulfillmentStatus === 'pending' ||
        existing.fulfillmentStatus === 'in_progress' ||
        existing.fulfillmentStatus === 'completed'

      await updateOrderItem(existing.id, {
        decisionDate: item.decisionDate,
        settlementAmount: item.settlementAmount,
        ...(shouldTransitionStatus ? { fulfillmentStatus: 'purchase_decided' as const } : {}),
      })
      decidedCount += 1

      console.log(
        `[PURCHASE_DECIDED] ${item.productOrderId} settlementAmount=${item.settlementAmount}`,
      )
    } catch (error) {
      const message = toErrorMessage(error)
      console.error(`[PURCHASE_DECIDED] 처리 실패 ${item.productOrderId}: ${message}`)
    }
  }

  return decidedCount
}

export async function pollAndProcess(
  orderSource: IOrderSource,
  store: Store = DEFAULT_STORE,
): Promise<OrderPollingResult> {
  const notify = discordNotifier(store)
  const items = await orderSource.fetchNewOrders()
  let processedCount = 0
  let failedCount = 0

  for (const item of items) {
    try {
      await processOrder(item, orderSource, 'main', store)
      processedCount += 1
    } catch (error) {
      failedCount += 1
      const message = toErrorMessage(error)
      await notify(
        'error',
        `❌ 주문 처리 중 예외 발생\n주문: ${item.productOrderId}\n오류: ${message}`,
      )
    }
  }

  const returnedCount = await processReturnedOrders(orderSource, store)
  const decidedCount = await processPurchaseDecidedOrders(orderSource)

  return {
    fetchedCount: items.length,
    processedCount,
    failedCount,
    returnedCount,
    decidedCount,
    recoveredCount: 0,
    skipped: false,
  }
}

export async function runBackupOrderScan(
  orderSource: IOrderSource,
  hoursBack: number,
  store: Store = DEFAULT_STORE,
): Promise<OrderPollingResult> {
  if (isPollingInProgress) {
    console.log('[BACKUP_SCAN] skip reason=in_progress')
    return {
      fetchedCount: 0,
      processedCount: 0,
      failedCount: 0,
      returnedCount: 0,
      decidedCount: 0,
      recoveredCount: 0,
      skipped: true,
    }
  }

  isPollingInProgress = true
  const startedAt = Date.now()
  console.log(`[BACKUP_SCAN] start hoursBack=${hoursBack}`)
  const notify = discordNotifier(store)

  try {
    const items = await orderSource.fetchPaidOrdersInWindow(hoursBack)
    let processedCount = 0
    let failedCount = 0
    let recoveredCount = 0

    // 1차: 각 주문의 현재 DB 상태 조회
    const beforeByProductOrderId = new Map<string, Awaited<ReturnType<typeof findOrderByProductOrderId>>>()
    for (const item of items) {
      beforeByProductOrderId.set(item.productOrderId, await findOrderByProductOrderId(item.productOrderId))
    }

    // returned 후보는 검색 데이터의 claim 필드가 불완전하므로, 권위 있는 상세(/query)로 재조회해 판정한다.
    const returnedCandidateIds = items
      .filter((item) => beforeByProductOrderId.get(item.productOrderId)?.fulfillmentStatus === 'returned')
      .map((item) => item.productOrderId)
    const detailByProductOrderId = new Map<string, IncomingOrderItem>()
    if (returnedCandidateIds.length > 0) {
      const details = await orderSource.fetchOrderDetailsByIds(returnedCandidateIds)
      for (const detail of details) {
        detailByProductOrderId.set(detail.productOrderId, detail)
      }
    }

    for (const item of items) {
      try {
        const before = beforeByProductOrderId.get(item.productOrderId) ?? null

        if (before && before.fulfillmentStatus === 'returned') {
          // 복구 판정은 검색 데이터가 아니라 상세 재조회 스냅샷으로 — claimType 기반(토글 차단)
          const detail = detailByProductOrderId.get(item.productOrderId)
          const decision = evaluateReturnedRecovery(
            {
              productOrderStatus: detail?.naverProductOrderStatus ?? null,
              claimType: detail?.naverClaimType ?? null,
              claimStatus: detail?.naverClaimStatus ?? null,
            },
            before.completedAt,
          )

          if (decision.recover) {
            const recoveredLabel = RECOVERED_STATUS_LABELS[decision.status]
            await updateOrderItem(before.id, {
              fulfillmentStatus: decision.status,
              returnedAt: null,
              // pending 복원일 때만 발송완료 기록 정리 — completed/purchase_decided 복원은 보존
              ...(decision.status === 'pending' ? { completedAt: null } : {}),
              errorMessage: `클레임 종료 후 자동 복귀 (${recoveredLabel})`,
            })
            await notify(
              'order',
              `↩️ 클레임 종료 → ${recoveredLabel} 상태로 복귀\n주문: ${item.productOrderId}\n상품: ${item.productName}\n네이버 상태: ${detail?.naverProductOrderStatus ?? '-'}${detail?.naverClaimType ? ` (claimType: ${detail.naverClaimType})` : ''}`,
            )
            recoveredCount += 1
          }
          // decision.recover === false → returned 유지 (진행 중 클레임 → 토글 차단)
          continue
        }

        await processOrder(item, orderSource, 'backup', store)
        if (!before) processedCount += 1
      } catch (error) {
        failedCount += 1
        const message = toErrorMessage(error)
        await notify(
          'error',
          `❌ 보조 스캔 처리 중 예외 발생\n주문: ${item.productOrderId}\n오류: ${message}`,
        )
      }
    }

    const durationMs = Date.now() - startedAt
    console.log(
      `[BACKUP_SCAN] done fetched=${items.length} processed=${processedCount} recovered=${recoveredCount} failed=${failedCount} duration_ms=${durationMs}`,
    )

    return {
      fetchedCount: items.length,
      processedCount,
      failedCount,
      returnedCount: 0,
      decidedCount: 0,
      recoveredCount,
      skipped: false,
    }
  } catch (error) {
    const message = toErrorMessage(error)
    const durationMs = Date.now() - startedAt
    console.error(`[BACKUP_SCAN] failed duration_ms=${durationMs}`, error)
    await notify('error', `❌ 보조 스캔 실패\n오류: ${message}`)
    throw error
  } finally {
    isPollingInProgress = false
  }
}

export type DailyReconciliationResult = {
  dateKST: string
  naverCount: number
  dbCount: number
  missingCount: number
  missingProductOrderIds: string[]
  staleReturnedCount: number
  staleReturnedProductOrderIds: string[]
}

export async function runDailyOrderReconciliation(
  orderSource: IOrderSource,
  store: Store = DEFAULT_STORE,
): Promise<DailyReconciliationResult> {
  const storeLabel = STORE_LABELS[store]
  const notify = discordNotifier(store)
  const yesterdayKstMs = Date.now() - 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000
  const yesterday = new Date(yesterdayKstMs).toISOString().slice(0, 10)
  const startedAt = Date.now()
  console.log(`[DAILY_RECONCILE] start store=${store} dateKST=${yesterday}`)

  const naverItems = await orderSource.fetchPaidOrdersForDay(yesterday)
  const naverProductOrderIds = naverItems.map((item) => item.productOrderId)

  const dayStartUtcMs = new Date(`${yesterday}T00:00:00.000+09:00`).getTime()
  const dayEndUtcMs = dayStartUtcMs + 24 * 60 * 60 * 1000

  const dbRows = await listOrdersPaidBetween(new Date(dayStartUtcMs), new Date(dayEndUtcMs))
  const dbProductOrderIds = new Set(dbRows.map((row) => row.productOrderId))
  const dbReturnedIds = new Set(
    dbRows.filter((row) => row.fulfillmentStatus === 'returned').map((row) => row.productOrderId),
  )

  const missing = naverItems.filter((item) => !dbProductOrderIds.has(item.productOrderId))

  // staleReturned 후보(DB=returned)를 권위 있는 상세로 재조회해 진짜 복구 가능한 것만 알림 — false-positive 제거
  const returnedCandidates = naverItems.filter((item) => dbReturnedIds.has(item.productOrderId))
  const staleDetailById = new Map<string, IncomingOrderItem>()
  if (returnedCandidates.length > 0) {
    const details = await orderSource.fetchOrderDetailsByIds(
      returnedCandidates.map((item) => item.productOrderId),
    )
    for (const detail of details) {
      staleDetailById.set(detail.productOrderId, detail)
    }
  }
  const staleReturned = returnedCandidates.filter((item) => {
    const detail = staleDetailById.get(item.productOrderId)
    return evaluateReturnedRecovery(
      {
        productOrderStatus: detail?.naverProductOrderStatus ?? null,
        claimType: detail?.naverClaimType ?? null,
        claimStatus: detail?.naverClaimStatus ?? null,
      },
      null,
    ).recover
  })

  if (missing.length > 0) {
    const lines = missing
      .slice(0, 20)
      .map(
        (item) =>
          `- ${item.productOrderId} / ${item.productName} / ${item.receiverName ?? '-'}`,
      )
    const moreLine = missing.length > 20 ? `\n... 외 ${missing.length - 20}건` : ''
    await notify(
      'error',
      `⚠️ [${storeLabel}] ${yesterday} 누락 주문 ${missing.length}건 발견 — 수동 확인 필요\n${lines.join('\n')}${moreLine}`,
    )
  }

  if (staleReturned.length > 0) {
    const lines = staleReturned
      .slice(0, 20)
      .map(
        (item) =>
          `- ${item.productOrderId} / ${item.productName} / ${item.naverProductOrderStatus ?? '-'}`,
      )
    const moreLine = staleReturned.length > 20 ? `\n... 외 ${staleReturned.length - 20}건` : ''
    await notify(
      'error',
      `⚠️ [${storeLabel}] ${yesterday} DB는 returned인데 네이버는 정상 상태인 주문 ${staleReturned.length}건 — 보조 스캔이 못 잡았는지 확인 필요\n${lines.join('\n')}${moreLine}`,
    )
  }

  const durationMs = Date.now() - startedAt
  console.log(
    `[DAILY_RECONCILE] done store=${store} dateKST=${yesterday} naver=${naverItems.length} db=${dbRows.length} missing=${missing.length} staleReturned=${staleReturned.length} duration_ms=${durationMs}`,
  )

  return {
    dateKST: yesterday,
    naverCount: naverItems.length,
    dbCount: dbRows.length,
    missingCount: missing.length,
    missingProductOrderIds: missing.map((item) => item.productOrderId),
    staleReturnedCount: staleReturned.length,
    staleReturnedProductOrderIds: staleReturned.map((item) => item.productOrderId),
  }
}

export type NaverStatusSyncResult = {
  changed: boolean
  action: 'returned' | 'recovered' | 'none'
  naverProductOrderStatus: string | null
  naverClaimType: string | null
  naverClaimStatus: string | null
  fulfillmentStatus: FulfillmentStatus
}

// 수동 재조회 — 주문 1건의 네이버 실제 상태를 조회해 DB와 양방향 동기화 (관리자 모달 버튼).
// 자동 감지(폴링 5분·보조 스캔 15분/6시간 창·일일 대조)의 시간 공백을 관리자가 즉시 메울 수 있다.
// 판정 기준은 폴링/보조 스캔과 동일 상수를 사용해 자동 감지와 결론이 어긋나지 않게 한다.
export async function syncNaverOrderStatus(orderId: string): Promise<NaverStatusSyncResult> {
  const order = await findOrderById(orderId)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  if (order.source !== 'naver') {
    throw Object.assign(new Error('네이버 주문만 재조회할 수 있습니다.'), { statusCode: 400 })
  }

  const store = order.store ?? DEFAULT_STORE
  const details = await fetchProductOrderDetails([order.productOrderId], store)
  const detail = details[0]
  if (!detail) {
    throw Object.assign(new Error('네이버에서 주문을 조회할 수 없습니다.'), { statusCode: 404 })
  }

  const naverStatus = detail.productOrder.productOrderStatus ?? null
  const claimType = detail.productOrder.claimType ?? null
  const claimStatus = detail.productOrder.claimStatus ?? null
  const notify = discordNotifier(store)

  // 자동(보조 스캔)과 동일한 claimType 기반 판정 — 결론 일치
  const snapshot: ClaimSnapshot = {
    productOrderStatus: naverStatus,
    claimType,
    claimStatus,
  }
  const claimInProgress = hasActiveCancelOrReturnClaim(snapshot)
  const claimFinalized =
    naverStatus !== null && FINAL_CLAIMED_PRODUCT_ORDER_STATUSES.includes(naverStatus)

  // ① 클레임 감지 — DB는 정상인데 네이버에 클레임 진행 중이거나 이미 취소/반품 확정
  if (order.fulfillmentStatus !== 'returned' && (claimInProgress || claimFinalized)) {
    const isCancel = claimType === 'CANCEL' || naverStatus === 'CANCELED'
    const claimLabel = isCancel ? '취소요청' : '반품'
    await updateOrderItem(order.id, {
      fulfillmentStatus: 'returned',
      returnedAt: new Date(),
      errorMessage: `${claimLabel} 클레임 감지 (수동 재조회, ${claimType ?? naverStatus}/${claimStatus ?? '-'})`,
    })
    await notify(
      'order',
      isCancel
        ? `🛑 취소요청 감지 (수동 재조회) — 작업 중단 필요\n주문: ${order.productOrderId}\n상품: ${order.productName}\n클레임 상태: ${claimStatus ?? naverStatus ?? '-'}`
        : `📦 반품 감지 (수동 재조회)\n주문: ${order.productOrderId}\n상품: ${order.productName}\n클레임 상태: ${claimStatus ?? naverStatus ?? '-'}`,
    )
    return {
      changed: true,
      action: 'returned',
      naverProductOrderStatus: naverStatus,
      naverClaimType: claimType,
      naverClaimStatus: claimStatus,
      fulfillmentStatus: 'returned',
    }
  }

  // ② 정상 복귀 — DB는 returned인데 네이버는 정상 + 활성 클레임 없음 (보조 스캔 복귀와 동일 판정)
  if (order.fulfillmentStatus === 'returned') {
    const decision = evaluateReturnedRecovery(snapshot, order.completedAt)
    if (decision.recover) {
      const recoveredLabel = RECOVERED_STATUS_LABELS[decision.status]
      await updateOrderItem(order.id, {
        fulfillmentStatus: decision.status,
        returnedAt: null,
        ...(decision.status === 'pending' ? { completedAt: null } : {}),
        errorMessage: `클레임 종료 — 수동 재조회로 ${recoveredLabel} 복귀`,
      })
      await notify(
        'order',
        `↩️ 클레임 종료 → ${recoveredLabel} 상태로 복귀 (수동 재조회)\n주문: ${order.productOrderId}\n상품: ${order.productName}\n네이버 상태: ${naverStatus}${claimStatus ? ` (claimStatus: ${claimStatus})` : ''}`,
      )
      return {
        changed: true,
        action: 'recovered',
        naverProductOrderStatus: naverStatus,
        naverClaimType: claimType,
        naverClaimStatus: claimStatus,
        fulfillmentStatus: decision.status,
      }
    }
  }

  // ③ 변경 없음 — 네이버 현재 상태만 반환
  return {
    changed: false,
    action: 'none',
    naverProductOrderStatus: naverStatus,
    naverClaimType: claimType,
    naverClaimStatus: claimStatus,
    fulfillmentStatus: order.fulfillmentStatus,
  }
}

export async function runOrderPolling(
  orderSource: IOrderSource,
  trigger: OrderPollingTrigger,
  store: Store = DEFAULT_STORE,
): Promise<OrderPollingResult> {
  if (isPollingInProgress) {
    console.log(`[ORDER_POLL] skip trigger=${trigger} store=${store} reason=in_progress`)
    return {
      fetchedCount: 0,
      processedCount: 0,
      failedCount: 0,
      returnedCount: 0,
      decidedCount: 0,
      recoveredCount: 0,
      skipped: true,
    }
  }

  isPollingInProgress = true
  const startedAt = Date.now()
  console.log(`[ORDER_POLL] start trigger=${trigger} store=${store}`)
  const notify = discordNotifier(store)

  try {
    const result = await pollAndProcess(orderSource, store)
    const durationMs = Date.now() - startedAt
    console.log(
      `[ORDER_POLL] done trigger=${trigger} store=${store} fetched=${result.fetchedCount} processed=${result.processedCount} failed=${result.failedCount} returned=${result.returnedCount} decided=${result.decidedCount} duration_ms=${durationMs}`,
    )
    return result
  } catch (error) {
    const message = toErrorMessage(error)
    const durationMs = Date.now() - startedAt
    console.error(`[ORDER_POLL] failed trigger=${trigger} store=${store} duration_ms=${durationMs}`, error)
    await notify('error', `❌ 주문 폴링 실패 [${STORE_LABELS[store]}]\n트리거: ${trigger}\n오류: ${message}`)
    throw error
  } finally {
    isPollingInProgress = false
  }
}
