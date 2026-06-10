import { FulfillmentStatus, OrderSource, Store } from '@prisma/client'
import {
  listOrders,
  exportOrders,
  findOrderById,
  findOrderByProductOrderId,
  updateOrderItem,
  groupOrderCountsByStatus,
  createManualOrderItem,
  generateManualProductOrderId,
  deleteOrderItemById,
  findOrdersForAutoExtend,
  incrementAutoExtendCount,
} from '../repositories/steamOrderRepository'
import { findExpenseBySteamOrderItemId } from '../repositories/expenseRepository'
import { findAccountById, markAccountAsSent } from '../repositories/steamAccountRepository'
import {
  isAlimtalkEnabled,
  sendOrderAlimtalk,
  sendOrderStatusAlimtalk,
  sendOrderCompletedAlimtalk,
} from './alimtalkService'
import { getSystemSettings } from './systemSettingsService'
import { sendDiscordAlert } from '../lib/discord'
import { detectProductType } from '../utils/productType'
import { parseReviewGameCount } from '../utils/reviewGameParser'

// 진행중 주문 시간 연장 단위(분)
const EXTEND_MINUTES = 10

// 자동 연장 주문당 최대 횟수 (총 +50분). 한도 초과 시 더 이상 자동 연장 안 함
const AUTO_EXTEND_MAX_COUNT = 5

// 자동 연장 임계치 (분) — estimatedCompletedAt까지 이 시간 이하로 남으면 트리거
const AUTO_EXTEND_THRESHOLD_MINUTES = 2

type ListOrdersInput = {
  status?: FulfillmentStatus
  from?: Date
  to?: Date
  receiverName?: string
  excludeStatuses?: FulfillmentStatus[]
  excludeWithExpense?: boolean
  source?: OrderSource
  store?: Store
  page: number
  pageSize: number
}

type ExportOrdersInput = {
  status?: FulfillmentStatus
  from?: Date
  to?: Date
  source?: OrderSource
}

type GetOrderCountsInput = {
  from?: Date
  to?: Date
  receiverName?: string
  source?: OrderSource
  store?: Store
}

// 수동 주문 생성 입력 — 상품주문번호·상태(대기)·결제일시(생성 시각)는 서버가 자동 설정
type CreateManualOrderInput = {
  productName: string
  receiverName: string
  netProfit: number
}

export async function getOrders(input: ListOrdersInput) {
  const result = await listOrders(input)
  return {
    ...result,
    items: result.items.map(({ expense, ...item }) => ({
      ...item,
      hasExpense: expense !== null,
    })),
  }
}

export async function getOrderCounts(input: GetOrderCountsInput) {
  const rows = await groupOrderCountsByStatus(input)
  const counts = {
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    purchase_decided: 0,
    manual_review: 0,
    failed: 0,
    returned: 0,
  }
  for (const r of rows) {
    counts[r.fulfillmentStatus] = r._count._all
    counts.total += r._count._all
  }
  return counts
}

export async function exportOrdersForExcel(input: ExportOrdersInput) {
  return exportOrders(input)
}

// 수동 주문 생성 — 상품주문번호 자동생성(MAN_), 상태=대기·결제일시=생성 시각 자동, Discord [수동] 알림
export async function createManualOrder(input: CreateManualOrderInput) {
  const productOrderId = await generateManualProductOrderId()
  const order = await createManualOrderItem({
    productOrderId,
    naverOrderId: productOrderId,
    productName: input.productName,
    receiverName: input.receiverName,
    netProfit: input.netProfit,
    fulfillmentStatus: 'pending',
    paidAt: new Date(),
  })

  await sendDiscordAlert(
    'order',
    `🔔 신규 주문 등록 [수동]\n상품: ${order.productName}\n수신자: ${order.receiverName ?? '-'}\n순수익: ${input.netProfit.toLocaleString('ko-KR')}원\n주문: ${order.productOrderId}`,
    { store: order.store },
  ).catch(() => {})

  return order
}

export async function getOrderDetail(id: string) {
  const order = await findOrderById(id)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return order
}

// 실패/수동검토 주문 재시도 — 이미 선점된 코드를 재사용해 알림톡만 재발송
export async function retryOrder(id: string): Promise<void> {
  const order = await findOrderById(id)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  if (!['failed', 'manual_review'].includes(order.fulfillmentStatus)) {
    throw Object.assign(
      new Error(`재시도 불가능한 상태입니다: ${order.fulfillmentStatus}`),
      { statusCode: 400 },
    )
  }

  if (!order.receiverPhoneNumber) {
    throw Object.assign(new Error('구매자 연락처가 없습니다. 수동 처리로 진행하세요.'), {
      statusCode: 400,
    })
  }

  const productType = detectProductType(order.productName)
  if (!productType) {
    throw Object.assign(new Error('상품 타입(NA/AA) 미감지'), { statusCode: 400 })
  }

  if (!(await isAlimtalkEnabled())) {
    throw Object.assign(new Error('알림톡 발송이 비활성화되어 있습니다.'), { statusCode: 400 })
  }

  if (productType === 'AA') {
    await sendOrderAlimtalk(
      {
        productType: 'AA',
        orderItemId: order.id,
        recipientPhoneNumber: order.receiverPhoneNumber,
        recipientName: order.receiverName,
        productName: order.productName,
        paidAt: order.paidAt ?? order.createdAt,
      },
      order.store,
    )
    await updateOrderItem(order.id, { fulfillmentStatus: 'pending', errorMessage: undefined })
    await sendDiscordAlert(
      'order',
      `✅ 재시도 처리 완료\n상품: ${order.productName}\n수신번호: ${order.receiverPhoneNumber}`,
      { store: order.store },
    )
    return
  }

  if (!order.accountId) {
    throw Object.assign(new Error('연결된 계정이 없습니다. 계정을 먼저 할당하세요.'), {
      statusCode: 400,
    })
  }

  const account = await findAccountById(order.accountId)
  if (!account) {
    throw Object.assign(new Error('연결된 계정을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  await sendOrderAlimtalk(
    {
      productType: 'NA',
      orderItemId: order.id,
      recipientPhoneNumber: order.receiverPhoneNumber,
      recipientName: order.receiverName,
      productName: order.productName,
      accountUsername: account.username,
      accountPassword: account.password,
      accountEmail: account.email,
      accountEmailPassword: account.emailPassword,
      accountEmailSiteUrl: account.emailSiteUrl,
      accountSecondaryEmail: account.secondaryEmail,
      accountSecondaryEmailPassword: account.secondaryEmailPassword,
      accountSecondaryEmailSiteUrl: account.secondaryEmailSiteUrl,
      paidAt: order.paidAt ?? order.createdAt,
    },
    order.store,
  )

  await markAccountAsSent(account.id)
  await updateOrderItem(order.id, { fulfillmentStatus: 'pending', errorMessage: undefined })

  await sendDiscordAlert(
    'order',
    `✅ 재시도 처리 완료\n상품: ${order.productName}\n수신번호: ${order.receiverPhoneNumber}`,
    { store: order.store },
  )
}

// 알림톡 발송 완료 Discord 알림 강조색 (종류별 구분)
const ALIMTALK_GIFT_COMPLETE_COLOR = 0xeb459e // 분홍 — 게임선물 완료
const ALIMTALK_ORDER_STATUS_COLOR = 0x00b0f4 // 하늘색 — 주문상황

// 알림톡 발송 결과 Discord 알림 — best-effort (실패해도 본 동작에 영향 없음)
// color 미전달 시 alimtalk 채널 기본색(노랑)으로 표시된다 (실패 알림 등).
async function notifyAlimtalkDiscord(
  message: string,
  store: Store | null,
  color?: number,
): Promise<void> {
  try {
    await sendDiscordAlert('alimtalk', message, { color, store })
  } catch (error) {
    console.error('[ALIMTALK_DISCORD] Discord 알림 전송 실패', error)
  }
}

// 주문 진행상황 조회 안내 알림톡 수동 발송 (관리자 주문 상세 모달)
export async function sendOrderStatusNotification(id: string): Promise<void> {
  const order = await findOrderById(id)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  if (!order.receiverPhoneNumber) {
    throw Object.assign(new Error('수신 전화번호가 없어 알림톡을 발송할 수 없습니다.'), {
      statusCode: 400,
    })
  }

  // 중복 발송 방지 — 이미 발송한 주문이면 차단
  if (order.orderStatusAlimtalkSentAt) {
    throw Object.assign(new Error('이미 주문상황 알림톡을 발송한 주문입니다.'), {
      statusCode: 400,
    })
  }

  const recipientLabel = `${order.receiverName ?? '미확인'} (${order.receiverPhoneNumber})`

  try {
    await sendOrderStatusAlimtalk(
      {
        orderItemId: order.id,
        recipientPhoneNumber: order.receiverPhoneNumber,
        recipientName: order.receiverName,
        productOrderId: order.productOrderId,
      },
      order.store,
    )
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    await notifyAlimtalkDiscord(
      `⚠️ 주문상황 알림톡 발송 실패\n상품: ${order.productName}\n수신: ${recipientLabel}\n사유: ${reason}`,
      order.store,
    )
    throw error
  }

  // 발송 성공 시각 기록 (재발송 차단)
  await updateOrderItem(order.id, { orderStatusAlimtalkSentAt: new Date() })

  await notifyAlimtalkDiscord(
    `📧 주문상황 알림톡 발송 완료\n상품: ${order.productName}\n수신: ${recipientLabel}`,
    order.store,
    ALIMTALK_ORDER_STATUS_COLOR,
  )
}

type UpdateFriendLinksInput = {
  friendLink1?: string | null
  friendLink2?: string | null
  giftCode?: string | null
  gameUrl?: string | null
  memo?: string | null
}

export async function updateFriendLinks(
  id: string,
  input: UpdateFriendLinksInput,
): Promise<void> {
  const order = await findOrderById(id)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  // 수동 주문은 운영자가 자유 입력한 상품명을 쓰므로 AA 패턴 검사를 면제한다.
  if (order.source !== 'manual' && detectProductType(order.productName) !== 'AA') {
    throw Object.assign(new Error('AA(선물형) 주문만 사용 가능합니다.'), { statusCode: 400 })
  }

  await updateOrderItem(id, {
    friendLink1: input.friendLink1,
    friendLink2: input.friendLink2,
    giftCode: input.giftCode,
    gameUrl: input.gameUrl,
    memo: input.memo,
  })
}

// 수동 주문 순수익 수정 — 수수료가 없으므로 생성과 동일하게 세 금액 필드에 같은 값을
// 갱신해 목록(금액)·상세(순수익)·집계(일일 리포트·대시보드)를 일치시킨다.
export async function updateManualOrderNetProfit(id: string, netProfit: number): Promise<void> {
  const order = await findOrderById(id)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  if (order.source !== 'manual') {
    throw Object.assign(new Error('수동 주문만 순수익을 수정할 수 있습니다.'), { statusCode: 400 })
  }

  await updateOrderItem(id, {
    unitPrice: netProfit,
    paymentAmount: netProfit,
    settlementAmount: netProfit,
  })
}

// 대기 → 진행중 수동 전환 (구매자 진행상황 페이지 2단계)
// 전역 기본 소요시간을 읽어 예상 완료시각을 함께 저장한다.
export async function markOrderInProgress(id: string): Promise<void> {
  const order = await findOrderById(id)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  if (order.fulfillmentStatus !== 'pending') {
    throw Object.assign(
      new Error(
        `대기 상태 주문만 진행중으로 전환할 수 있습니다. 현재 상태: ${order.fulfillmentStatus}`,
      ),
      { statusCode: 400 },
    )
  }

  const { defaultDurationMinutes } = await getSystemSettings()
  const estimatedCompletedAt = new Date(Date.now() + defaultDurationMinutes * 60_000)

  await updateOrderItem(order.id, {
    fulfillmentStatus: 'in_progress',
    estimatedCompletedAt,
  })
}

// 진행중 주문의 예상 완료시각을 10분 연장
export async function extendOrderEstimatedTime(id: string): Promise<void> {
  const order = await findOrderById(id)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  if (order.fulfillmentStatus !== 'in_progress') {
    throw Object.assign(
      new Error(`진행중 상태 주문만 시간을 연장할 수 있습니다. 현재 상태: ${order.fulfillmentStatus}`),
      { statusCode: 400 },
    )
  }

  if (!order.estimatedCompletedAt) {
    throw Object.assign(new Error('예상 완료시각이 설정되지 않은 주문입니다.'), {
      statusCode: 400,
    })
  }

  const extended = new Date(order.estimatedCompletedAt.getTime() + EXTEND_MINUTES * 60_000)
  await updateOrderItem(order.id, { estimatedCompletedAt: extended })
}

// 자동 +10분 연장 — 1분 주기 스케줄러에서 호출. 후보 주문을 찾아 한 건씩 연장 + Discord 알림
// 한도(AUTO_EXTEND_MAX_COUNT) 도달 주문은 후보에서 제외되므로 더 이상 연장되지 않는다.
type AutoExtendResult = {
  scanned: number
  extended: number
  skipped: number
}

export async function runAutoExtendCheck(): Promise<AutoExtendResult> {
  const thresholdAt = new Date(Date.now() + AUTO_EXTEND_THRESHOLD_MINUTES * 60_000)
  const candidates = await findOrdersForAutoExtend(thresholdAt, AUTO_EXTEND_MAX_COUNT)

  let extended = 0
  let skipped = 0

  for (const order of candidates) {
    // 한도 재검증 — 동시성으로 인해 후보 조회 후 다른 경로에서 카운트가 증가했을 가능성 차단
    if (order.autoExtendCount + 1 > AUTO_EXTEND_MAX_COUNT) {
      skipped += 1
      continue
    }
    if (!order.estimatedCompletedAt) {
      skipped += 1
      continue
    }

    const newEstimatedAt = new Date(order.estimatedCompletedAt.getTime() + EXTEND_MINUTES * 60_000)

    try {
      const { autoExtendCount: newCount } = await incrementAutoExtendCount(
        order.id,
        newEstimatedAt,
      )
      extended += 1

      const receiver = order.receiverName ?? '미확인'
      const message = `⏰ **예상 완료시각 자동 +${EXTEND_MINUTES}분 연장**\n상품: ${order.productName}\n수신자: ${receiver}\n주문: ${order.productOrderId}\n자동 연장: ${newCount}/${AUTO_EXTEND_MAX_COUNT}회`
      sendDiscordAlert('auto_extend', message, { store: order.store }).catch((err) => {
        console.error('[AUTO_EXTEND] Discord 알림 실패', err)
      })
    } catch (err) {
      console.error('[AUTO_EXTEND] 연장 실패', { orderId: order.id, err })
      skipped += 1
    }
  }

  return { scanned: candidates.length, extended, skipped }
}

export async function manualCompleteOrder(id: string): Promise<void> {
  const order = await findOrderById(id)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  if (order.completedAt) {
    throw Object.assign(new Error('이미 완료 처리된 주문입니다.'), { statusCode: 400 })
  }

  const completable: FulfillmentStatus[] = ['pending', 'in_progress', 'purchase_decided']
  if (!completable.includes(order.fulfillmentStatus)) {
    throw Object.assign(
      new Error(
        `대기/진행중/구매확정 상태 주문만 완료 처리할 수 있습니다. 현재 상태: ${order.fulfillmentStatus}`,
      ),
      { statusCode: 400 },
    )
  }

  // 수동 주문은 '구매확정', 네이버 주문은 '완료'를 종료 상태로 사용한다.
  // 이미 구매확정(네이버 구매자 확정) 주문은 뱃지를 그대로 두고 발송완료 시각만 기록한다.
  const completedStatus: FulfillmentStatus =
    order.source === 'manual' ? 'purchase_decided' : 'completed'
  await updateOrderItem(order.id, {
    completedAt: new Date(),
    ...(order.fulfillmentStatus === 'purchase_decided'
      ? {}
      : { fulfillmentStatus: completedStatus }),
  })

  // 대기/진행중 주문 완료 시 게임선물 완료 안내 알림톡 발송 (구매확정 주문은 제외).
  // 발송 실패는 완료 처리를 막지 않는다 — 실패 사유는 DeliveryLog에 기록된다.
  const phone = order.receiverPhoneNumber
  if (
    phone &&
    (order.fulfillmentStatus === 'pending' || order.fulfillmentStatus === 'in_progress')
  ) {
    const recipientLabel = `${order.receiverName ?? '미확인'} (${phone})`
    try {
      await sendOrderCompletedAlimtalk(
        {
          orderItemId: order.id,
          recipientPhoneNumber: phone,
          recipientName: order.receiverName,
        },
        order.store,
      )
      await notifyAlimtalkDiscord(
        `🎉 게임선물 완료 알림톡 발송 완료\n상품: ${order.productName}\n수신: ${recipientLabel}`,
        order.store,
        ALIMTALK_GIFT_COMPLETE_COLOR,
      )
    } catch (error) {
      console.error('[ORDER_COMPLETE] 완료 알림톡 발송 실패', error)
      const reason = error instanceof Error ? error.message : String(error)
      await notifyAlimtalkDiscord(
        `⚠️ 게임선물 완료 알림톡 발송 실패\n상품: ${order.productName}\n수신: ${recipientLabel}\n사유: ${reason}`,
        order.store,
      )
    }
  }
}

// 구매자용 공개 진행상황 조회 — 노출 정보 최소화 (연락처·계정·금액 등 제외)
type OrderTrackingResult = {
  productName: string
  fulfillmentStatus: FulfillmentStatus
  paidAt: Date | null
  updatedAt: Date
  returnedAt: Date | null
  estimatedCompletedAt: Date | null
  completedAt: Date | null
  // 리뷰게임 발송 개수 — 내부 store 정보를 노출하지 않기 위해 서버에서 파싱해 내려준다
  reviewGameCount: number | null
}

export async function getOrderTracking(productOrderId: string): Promise<OrderTrackingResult> {
  const order = await findOrderByProductOrderId(productOrderId)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다. 상품주문번호를 확인해 주세요.'), {
      statusCode: 404,
    })
  }

  return {
    productName: order.productName,
    fulfillmentStatus: order.fulfillmentStatus,
    paidAt: order.paidAt,
    updatedAt: order.updatedAt,
    returnedAt: order.returnedAt,
    estimatedCompletedAt: order.estimatedCompletedAt,
    completedAt: order.completedAt,
    reviewGameCount: parseReviewGameCount(order.productName, order.store),
  }
}

// 수동 주문 삭제 — source='manual' 한정, 지출 연결 시 차단, DeliveryLog는 Cascade로 함께 제거
export async function deleteManualOrder(id: string): Promise<void> {
  const order = await findOrderById(id)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  if (order.source !== 'manual') {
    throw Object.assign(new Error('수동 주문만 삭제할 수 있습니다.'), { statusCode: 400 })
  }

  const linkedExpense = await findExpenseBySteamOrderItemId(id)
  if (linkedExpense) {
    throw Object.assign(
      new Error(
        '지출이 연결된 주문은 삭제할 수 없습니다. 먼저 지출 관리에서 연결을 해제하거나 지출을 삭제하세요.',
      ),
      { statusCode: 409 },
    )
  }

  await deleteOrderItemById(id)
}

export async function manualReturnOrder(id: string): Promise<void> {
  const order = await findOrderById(id)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  if (order.fulfillmentStatus === 'returned') {
    throw Object.assign(new Error('이미 반품 처리된 주문입니다.'), { statusCode: 400 })
  }

  await updateOrderItem(order.id, {
    fulfillmentStatus: 'returned',
    returnedAt: new Date(),
  })

  const sourceTag = order.source === 'manual' ? ' [수동]' : ''
  await sendDiscordAlert(
    'order',
    `📦 수동 반품 처리${sourceTag}\n주문: ${order.productOrderId}\n상품: ${order.productName}`,
    { store: order.store },
  )
}
