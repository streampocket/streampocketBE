import { sendDiscordAlert } from '../lib/discord'
import {
  createOrderItem,
  findOrderByProductOrderId,
  listOrdersPaidBetween,
  updateOrderItem,
} from '../repositories/steamOrderRepository'
import { findProductByNaverId } from '../repositories/steamProductRepository'
import {
  reserveNextAvailableAccount,
  countAvailableAccounts,
  markAccountAsSent,
} from '../repositories/steamAccountRepository'
import { detectProductType } from '../utils/productType'
import { IOrderSource, IncomingOrderItem } from './platform/IOrderSource'
import { isAlimtalkEnabled, sendOrderAlimtalk } from './alimtalkService'

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
  skipped: boolean
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export async function processOrder(
  item: IncomingOrderItem,
  orderSource: IOrderSource,
  source: OrderSource = 'main',
): Promise<void> {
  const existing = await findOrderByProductOrderId(item.productOrderId)
  if (existing) return

  const sourceTag = source === 'backup' ? ' (보조 스캔으로 사후 포착)' : ''
  await sendDiscordAlert(
    'order',
    `🔔 신규 주문 감지${sourceTag}\n상품: ${item.productName}\n금액: ${item.unitPrice.toLocaleString('ko-KR')}원\n수신자: ${item.receiverName ?? '-'}\n주문: ${item.productOrderId}`,
  )

  const orderItem = await createOrderItem({
    productOrderId: item.productOrderId,
    naverOrderId: item.externalOrderId,
    productName: item.productName,
    unitPrice: item.unitPrice,
    receiverPhoneNumber: item.receiverPhoneNumber ?? undefined,
    receiverName: item.receiverName ?? undefined,
    paidAt: item.paidAt,
  })

  if (!item.receiverPhoneNumber) {
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'manual_review',
      errorMessage: '구매자 연락처 조회 실패',
    })
    await sendDiscordAlert(
      'error',
      `⚠️ 구매자 연락처 조회 실패 및 수동 처리 필요\n주문: ${item.productOrderId}\n상품: ${item.productName}`,
    )
    return
  }

  const product = await findProductByNaverId(item.naverProductId)
  if (!product) {
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'manual_review',
      errorMessage: `네이버 상품 ID(${item.naverProductId})와 매핑되는 상품 없음`,
    })
    await sendDiscordAlert(
      'error',
      `⚠️ 상품 매핑 실패 및 수동 처리 필요\n주문: ${item.productOrderId}\n네이버 상품 ID: ${item.naverProductId}`,
    )
    return
  }

  await updateOrderItem(orderItem.id, { productId: product.id })

  const productType = detectProductType(product.name)
  if (productType === null) {
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'manual_review',
      errorMessage: '상품 타입(NA/AA) 미감지',
    })
    await sendDiscordAlert(
      'error',
      `⚠️ 상품 타입 미감지\n상품: ${product.name}\n주문번호: ${item.productOrderId}`,
    )
    return
  }

  if (productType === 'AA') {
    try {
      await orderSource.confirmOrder(item.productOrderId)
    } catch (error) {
      const message = toErrorMessage(error)
      await updateOrderItem(orderItem.id, {
        fulfillmentStatus: 'failed',
        errorMessage: `발주 확인 실패: ${message}`,
      })
      await sendDiscordAlert(
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
      await sendDiscordAlert(
        'error',
        `❌ 발송 처리 실패\n주문: ${item.productOrderId}\n오류: ${message}`,
      )
      return
    }

    try {
      const alimtalkEnabled = await isAlimtalkEnabled()
      if (!alimtalkEnabled) {
        await updateOrderItem(orderItem.id, {
          fulfillmentStatus: 'manual_review',
          errorMessage: '알림톡 발송이 비활성화되어 수동 처리로 전환됨',
        })
        await sendDiscordAlert(
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
      })

      await updateOrderItem(orderItem.id, { fulfillmentStatus: 'completed' })
      await sendDiscordAlert(
        'order',
        `🛒 AA 계정 주문\n상품: ${item.productName}\n주문번호: ${item.productOrderId}\n알림톡: ✅ 발송 성공`,
      )
    } catch (error) {
      const message = toErrorMessage(error)
      await updateOrderItem(orderItem.id, {
        fulfillmentStatus: 'manual_review',
        errorMessage: `알림톡 발송 실패: ${message}`,
      })
      await sendDiscordAlert(
        'error',
        `🛒 AA 계정 주문 — 알림톡 발송 실패\n상품: ${item.productName}\n주문번호: ${item.productOrderId}\n알림톡: ❌ ${message}`,
      )
    }
    return
  }

  const account = await reserveNextAvailableAccount(product.id)
  if (!account) {
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'failed',
      errorMessage: `재고 부족: ${product.name}`,
    })
    await sendDiscordAlert(
      'stock',
      `🚨 재고 부족. 즉시 보충 필요\n상품: ${product.name}\n주문: ${item.productOrderId}`,
    )
    return
  }

  await updateOrderItem(orderItem.id, { accountId: account.id })

  const remaining = await countAvailableAccounts(product.id)
  if (remaining <= LOW_STOCK_THRESHOLD) {
    await sendDiscordAlert(
      'stock',
      `⚠️ 재고 부족 경고\n상품: ${product.name}\n남은 코드: ${remaining}개`,
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
    await sendDiscordAlert(
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
    await sendDiscordAlert(
      'error',
      `❌ 발송 처리 실패\n주문: ${item.productOrderId}\n오류: ${message}`,
    )
    return
  }

  await sendDiscordAlert(
    'order',
    `✅ 주문 처리 완료 (네이버)\n상품: ${item.productName}\n주문번호: ${item.productOrderId}`,
  )

  try {
    const alimtalkEnabled = await isAlimtalkEnabled()
    if (!alimtalkEnabled) {
      await updateOrderItem(orderItem.id, {
        fulfillmentStatus: 'manual_review',
        errorMessage: '알림톡 발송이 비활성화되어 수동 처리로 전환됨',
      })
      await sendDiscordAlert(
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
    })
  } catch (error) {
    const message = toErrorMessage(error)
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'manual_review',
      errorMessage: `알림톡 발송 실패: ${message}`,
    })
    await sendDiscordAlert(
      'error',
      `❌ 알림톡 발송 실패 및 수동 개입 필요\n주문: ${item.productOrderId}\n수신번호: ${item.receiverPhoneNumber}`,
    )
    return
  }

  await markAccountAsSent(account.id)
  await updateOrderItem(orderItem.id, { fulfillmentStatus: 'completed' })

  await sendDiscordAlert(
    'order',
    `✅ 알림톡 발송 성공\n주문: ${item.productOrderId}\n수신번호: ${item.receiverPhoneNumber}`,
  )
}

export async function processReturnedOrders(orderSource: IOrderSource): Promise<number> {
  const returnedItems = await orderSource.fetchReturnedOrders()
  let returnedCount = 0

  for (const item of returnedItems) {
    try {
      const existing = await findOrderByProductOrderId(item.productOrderId)

      if (!existing) {
        const created = await createOrderItem({
          productOrderId: item.productOrderId,
          naverOrderId: item.externalOrderId,
          productName: item.productName,
          unitPrice: item.unitPrice,
          receiverPhoneNumber: item.receiverPhoneNumber ?? undefined,
          receiverName: item.receiverName ?? undefined,
          paidAt: item.paidAt,
        })
        await updateOrderItem(created.id, {
          fulfillmentStatus: 'returned',
          returnedAt: new Date(),
        })
        returnedCount += 1

        await sendDiscordAlert(
          'order',
          `🔁 사후 포착된 반품 주문 (PAYED 지연으로 신규 알림 미발송)\n주문: ${item.productOrderId}\n상품: ${item.productName}\n수신자: ${item.receiverName ?? '-'}\n클레임 상태: ${item.claimStatus}`,
        )
        continue
      }

      if (existing.fulfillmentStatus === 'returned') continue

      await updateOrderItem(existing.id, {
        fulfillmentStatus: 'returned',
        returnedAt: new Date(),
      })
      returnedCount += 1

      await sendDiscordAlert(
        'order',
        `📦 반품 감지\n주문: ${item.productOrderId}\n상품: ${existing.productName}\n클레임 상태: ${item.claimStatus}`,
      )
    } catch (error) {
      const message = toErrorMessage(error)
      await sendDiscordAlert(
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

      await updateOrderItem(existing.id, {
        decisionDate: item.decisionDate,
        settlementAmount: item.settlementAmount,
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

export async function pollAndProcess(orderSource: IOrderSource): Promise<OrderPollingResult> {
  const items = await orderSource.fetchNewOrders()
  let processedCount = 0
  let failedCount = 0

  for (const item of items) {
    try {
      await processOrder(item, orderSource)
      processedCount += 1
    } catch (error) {
      failedCount += 1
      const message = toErrorMessage(error)
      await sendDiscordAlert(
        'error',
        `❌ 주문 처리 중 예외 발생\n주문: ${item.productOrderId}\n오류: ${message}`,
      )
    }
  }

  const returnedCount = await processReturnedOrders(orderSource)
  const decidedCount = await processPurchaseDecidedOrders(orderSource)

  return {
    fetchedCount: items.length,
    processedCount,
    failedCount,
    returnedCount,
    decidedCount,
    skipped: false,
  }
}

export async function runBackupOrderScan(
  orderSource: IOrderSource,
  hoursBack: number,
): Promise<OrderPollingResult> {
  if (isPollingInProgress) {
    console.log('[BACKUP_SCAN] skip reason=in_progress')
    return {
      fetchedCount: 0,
      processedCount: 0,
      failedCount: 0,
      returnedCount: 0,
      decidedCount: 0,
      skipped: true,
    }
  }

  isPollingInProgress = true
  const startedAt = Date.now()
  console.log(`[BACKUP_SCAN] start hoursBack=${hoursBack}`)

  try {
    const items = await orderSource.fetchPaidOrdersInWindow(hoursBack)
    let processedCount = 0
    let failedCount = 0

    for (const item of items) {
      try {
        const before = await findOrderByProductOrderId(item.productOrderId)
        await processOrder(item, orderSource, 'backup')
        if (!before) processedCount += 1
      } catch (error) {
        failedCount += 1
        const message = toErrorMessage(error)
        await sendDiscordAlert(
          'error',
          `❌ 보조 스캔 처리 중 예외 발생\n주문: ${item.productOrderId}\n오류: ${message}`,
        )
      }
    }

    const durationMs = Date.now() - startedAt
    console.log(
      `[BACKUP_SCAN] done fetched=${items.length} processed=${processedCount} failed=${failedCount} duration_ms=${durationMs}`,
    )

    return {
      fetchedCount: items.length,
      processedCount,
      failedCount,
      returnedCount: 0,
      decidedCount: 0,
      skipped: false,
    }
  } catch (error) {
    const message = toErrorMessage(error)
    const durationMs = Date.now() - startedAt
    console.error(`[BACKUP_SCAN] failed duration_ms=${durationMs}`, error)
    await sendDiscordAlert('error', `❌ 보조 스캔 실패\n오류: ${message}`)
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
}

export async function runDailyOrderReconciliation(
  orderSource: IOrderSource,
): Promise<DailyReconciliationResult> {
  const yesterdayKstMs = Date.now() - 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000
  const yesterday = new Date(yesterdayKstMs).toISOString().slice(0, 10)
  const startedAt = Date.now()
  console.log(`[DAILY_RECONCILE] start dateKST=${yesterday}`)

  const naverItems = await orderSource.fetchPaidOrdersForDay(yesterday)
  const naverProductOrderIds = naverItems.map((item) => item.productOrderId)

  const dayStartUtcMs = new Date(`${yesterday}T00:00:00.000+09:00`).getTime()
  const dayEndUtcMs = dayStartUtcMs + 24 * 60 * 60 * 1000

  const dbRows = await listOrdersPaidBetween(new Date(dayStartUtcMs), new Date(dayEndUtcMs))
  const dbProductOrderIds = new Set(dbRows.map((row) => row.productOrderId))

  const missing = naverItems.filter((item) => !dbProductOrderIds.has(item.productOrderId))

  if (missing.length > 0) {
    const lines = missing
      .slice(0, 20)
      .map(
        (item) =>
          `- ${item.productOrderId} / ${item.productName} / ${item.receiverName ?? '-'}`,
      )
    const moreLine = missing.length > 20 ? `\n... 외 ${missing.length - 20}건` : ''
    await sendDiscordAlert(
      'error',
      `⚠️ ${yesterday} 누락 주문 ${missing.length}건 발견 — 수동 확인 필요\n${lines.join('\n')}${moreLine}`,
    )
  }

  const durationMs = Date.now() - startedAt
  console.log(
    `[DAILY_RECONCILE] done dateKST=${yesterday} naver=${naverItems.length} db=${dbRows.length} missing=${missing.length} duration_ms=${durationMs}`,
  )

  return {
    dateKST: yesterday,
    naverCount: naverItems.length,
    dbCount: dbRows.length,
    missingCount: missing.length,
    missingProductOrderIds: missing.map((item) => item.productOrderId),
  }
}

export async function runOrderPolling(
  orderSource: IOrderSource,
  trigger: OrderPollingTrigger,
): Promise<OrderPollingResult> {
  if (isPollingInProgress) {
    console.log(`[ORDER_POLL] skip trigger=${trigger} reason=in_progress`)
    return {
      fetchedCount: 0,
      processedCount: 0,
      failedCount: 0,
      returnedCount: 0,
      decidedCount: 0,
      skipped: true,
    }
  }

  isPollingInProgress = true
  const startedAt = Date.now()
  console.log(`[ORDER_POLL] start trigger=${trigger}`)

  try {
    const result = await pollAndProcess(orderSource)
    const durationMs = Date.now() - startedAt
    console.log(
      `[ORDER_POLL] done trigger=${trigger} fetched=${result.fetchedCount} processed=${result.processedCount} failed=${result.failedCount} returned=${result.returnedCount} decided=${result.decidedCount} duration_ms=${durationMs}`,
    )
    return result
  } catch (error) {
    const message = toErrorMessage(error)
    const durationMs = Date.now() - startedAt
    console.error(`[ORDER_POLL] failed trigger=${trigger} duration_ms=${durationMs}`, error)
    await sendDiscordAlert('error', `❌ 주문 폴링 실패\n트리거: ${trigger}\n오류: ${message}`)
    throw error
  } finally {
    isPollingInProgress = false
  }
}
