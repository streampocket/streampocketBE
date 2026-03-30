import { sendDiscordAlert } from '../lib/discord'
import {
  createOrderItem,
  findOrderByProductOrderId,
  updateOrderItem,
} from '../repositories/steamOrderRepository'
import { findProductByNaverId } from '../repositories/steamProductRepository'
import {
  reserveNextAvailableAccount,
  countAvailableAccounts,
  markAccountAsSent,
} from '../repositories/steamAccountRepository'
import { IOrderSource, IncomingOrderItem } from './platform/IOrderSource'
import { isAlimtalkEnabled, sendOrderAlimtalk } from './alimtalkService'

const LOW_STOCK_THRESHOLD = Number(process.env['LOW_STOCK_THRESHOLD'] ?? 2)

let isPollingInProgress = false

export type OrderPollingTrigger = 'startup' | 'interval' | 'manual'

export type OrderPollingResult = {
  fetchedCount: number
  processedCount: number
  failedCount: number
  skipped: boolean
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

// 단일 주문 아이템을 풀필먼트 처리
export async function processOrder(
  item: IncomingOrderItem,
  orderSource: IOrderSource,
): Promise<void> {
  const existing = await findOrderByProductOrderId(item.productOrderId)
  if (existing) return

  await sendDiscordAlert(
    'order',
    `🆕 신규 주문 감지\n상품: ${item.productName}\n주문: ${item.productOrderId}`,
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
      `⚠️ 구매자 연락처 조회 실패 — 수동 처리 필요\n주문: ${item.productOrderId}\n상품: ${item.productName}`,
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
      `⚠️ 상품 매핑 실패 — 수동 처리 필요\n주문: ${item.productOrderId}\n네이버 상품 ID: ${item.naverProductId}`,
    )
    return
  }

  await updateOrderItem(orderItem.id, { productId: product.id })

  const account = await reserveNextAvailableAccount(product.id)
  if (!account) {
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'failed',
      errorMessage: `재고 부족: ${product.name}`,
    })
    await sendDiscordAlert(
      'stock',
      `🚨 재고 부족 — 즉시 보충 필요\n상품: ${product.name}\n주문: ${item.productOrderId}`,
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
        `⚠️ 알림톡 발송 비활성화 — 수동 처리 필요\n주문: ${item.productOrderId}\n수신번호: ${item.receiverPhoneNumber}`,
      )
      return
    }

    await sendOrderAlimtalk({
      orderItemId: orderItem.id,
      recipientPhoneNumber: item.receiverPhoneNumber,
      recipientName: item.receiverName,
      productName: item.productName,
      accountUsername: account.username,
      accountPassword: account.password,
      accountEmail: account.email,
      accountEmailPassword: account.emailPassword,
      accountEmailSiteUrl: account.emailSiteUrl,
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
      `❌ 알림톡 발송 실패 — 수동 재발송 필요\n주문: ${item.productOrderId}\n수신번호: ${item.receiverPhoneNumber}`,
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

// 변경된 주문 목록 전체 처리
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

  return {
    fetchedCount: items.length,
    processedCount,
    failedCount,
    skipped: false,
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
      `[ORDER_POLL] done trigger=${trigger} fetched=${result.fetchedCount} processed=${result.processedCount} failed=${result.failedCount} duration_ms=${durationMs}`,
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
