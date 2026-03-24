import { sendDiscordAlert } from '../lib/discord'
import {
  createOrderItem,
  findOrderByProductOrderId,
  updateOrderItem,
} from '../repositories/steamOrderRepository'
import { findProductByNaverId } from '../repositories/steamProductRepository'
import {
  reserveNextAvailableCode,
  countAvailableCodes,
  markCodeAsSent,
} from '../repositories/steamCodeRepository'
import { sendCodeEmail } from './steamEmailService'
import { IOrderSource, IncomingOrderItem } from './platform/IOrderSource'

const LOW_STOCK_THRESHOLD = Number(process.env['LOW_STOCK_THRESHOLD'] ?? 2)

// 단일 주문 아이템 풀필먼트 처리
export async function processOrder(
  item: IncomingOrderItem,
  orderSource: IOrderSource,
): Promise<void> {
  // 1. 멱등 체크 — 이미 처리된 주문이면 skip
  const existing = await findOrderByProductOrderId(item.productOrderId)
  if (existing) return

  // 2. SteamOrderItem 생성 (pending)
  const orderItem = await createOrderItem({
    productOrderId: item.productOrderId,
    naverOrderId: item.externalOrderId,
    productName: item.productName,
    unitPrice: item.unitPrice,
    buyerEmail: item.buyerEmail ?? undefined,
    paidAt: item.paidAt,
  })

  // 3. 이메일 파싱 실패 → manual_review
  if (!item.buyerEmail) {
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'manual_review',
      errorMessage: '구매자 이메일 파싱 실패 (inputOptions에서 이메일을 찾을 수 없음)',
    })
    await sendDiscordAlert(
      'error',
      `⚠️ 이메일 파싱 실패 — 수동 처리 필요\n주문: ${item.productOrderId}\n상품: ${item.productName}`,
    )
    return
  }

  // 4. 상품 매칭
  const product = await findProductByNaverId(item.naverProductId)
  if (!product) {
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'manual_review',
      errorMessage: `네이버 상품 ID(${item.naverProductId})에 매칭되는 상품 없음`,
    })
    await sendDiscordAlert(
      'error',
      `⚠️ 상품 매칭 실패 — 수동 처리 필요\n주문: ${item.productOrderId}\n네이버 상품 ID: ${item.naverProductId}`,
    )
    return
  }

  await updateOrderItem(orderItem.id, { productId: product.id })

  // 5. 코드 선점 (FIFO)
  const code = await reserveNextAvailableCode(product.id)
  if (!code) {
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'failed',
      errorMessage: `재고 소진 — ${product.name}`,
    })
    await sendDiscordAlert(
      'stock',
      `🚨 재고 소진 — 즉시 보충 필요\n상품: ${product.name}\n주문: ${item.productOrderId}`,
    )
    return
  }

  await updateOrderItem(orderItem.id, { codeId: code.id })

  // 재고 임계치 경고 (선점 후 잔여 재고 체크)
  const remaining = await countAvailableCodes(product.id)
  if (remaining <= LOW_STOCK_THRESHOLD) {
    await sendDiscordAlert(
      'stock',
      `⚠️ 재고 부족 경고\n상품: ${product.name}\n잔여 코드: ${remaining}개`,
    )
  }

  // 6. 발주 확인
  try {
    await orderSource.confirmOrder(item.productOrderId)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'failed',
      errorMessage: `발주 확인 실패: ${message}`,
    })
    await sendDiscordAlert('error', `❌ 발주 확인 실패\n주문: ${item.productOrderId}\n오류: ${message}`)
    return
  }

  // 7. 발송 처리
  try {
    await orderSource.dispatchOrder(item.productOrderId)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'failed',
      errorMessage: `발송 처리 실패: ${message}`,
    })
    await sendDiscordAlert('error', `❌ 발송 처리 실패\n주문: ${item.productOrderId}\n오류: ${message}`)
    return
  }

  // 8. 이메일 발송
  try {
    await sendCodeEmail({
      orderItemId: orderItem.id,
      recipientEmail: item.buyerEmail,
      productName: item.productName,
      codeValue: code.codeValue,
      description: product.description,
      caution: product.caution,
      event: product.event,
      paidAt: item.paidAt,
    })
  } catch (err) {
    // 이메일 실패는 EmailLog에 기록됨 — 주문 자체는 manual_review로 전환
    const message = err instanceof Error ? err.message : String(err)
    await updateOrderItem(orderItem.id, {
      fulfillmentStatus: 'manual_review',
      errorMessage: `이메일 발송 실패: ${message}`,
    })
    await sendDiscordAlert(
      'error',
      `❌ 이메일 발송 실패 — 수동 재발송 필요\n주문: ${item.productOrderId}\n수신자: ${item.buyerEmail}`,
    )
    return
  }

  // 9. 코드 → sent, 주문 → completed
  await markCodeAsSent(code.id)
  await updateOrderItem(orderItem.id, { fulfillmentStatus: 'completed' })

  await sendDiscordAlert(
    'order',
    `✅ 주문 처리 완료\n상품: ${item.productName}\n수신자: ${item.buyerEmail}`,
  )
}

// 크론 진입점 — 신규 주문 전체 처리
export async function pollAndProcess(orderSource: IOrderSource): Promise<number> {
  const items = await orderSource.fetchNewOrders()
  let processed = 0

  for (const item of items) {
    try {
      await processOrder(item, orderSource)
      processed++
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      await sendDiscordAlert(
        'error',
        `❌ 주문 처리 중 예외 발생\n주문: ${item.productOrderId}\n오류: ${message}`,
      )
    }
  }

  return processed
}
