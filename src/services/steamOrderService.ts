import { FulfillmentStatus } from '@prisma/client'
import {
  listOrders,
  findOrderById,
  updateOrderItem,
} from '../repositories/steamOrderRepository'
import { findProductById } from '../repositories/steamProductRepository'
import { findCodeById } from '../repositories/steamCodeRepository'
import { sendCodeEmail } from './steamEmailService'
import { sendDiscordAlert } from '../lib/discord'
import { markCodeAsSent } from '../repositories/steamCodeRepository'

type ListOrdersInput = {
  status?: FulfillmentStatus
  from?: Date
  to?: Date
  page: number
  pageSize: number
}

export async function getOrders(input: ListOrdersInput) {
  return listOrders(input)
}

export async function getOrderDetail(id: string) {
  const order = await findOrderById(id)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return order
}

// 실패/수동검토 주문 재시도 — 이미 선점된 코드를 재사용해 이메일만 재발송
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

  if (!order.buyerEmail) {
    throw Object.assign(new Error('구매자 이메일이 없습니다. 직접 입력 후 재시도하세요.'), {
      statusCode: 400,
    })
  }

  if (!order.codeId) {
    throw Object.assign(new Error('연결된 코드가 없습니다. 코드를 먼저 할당하세요.'), {
      statusCode: 400,
    })
  }

  const code = await findCodeById(order.codeId)
  if (!code) {
    throw Object.assign(new Error('연결된 코드를 찾을 수 없습니다.'), { statusCode: 404 })
  }

  const product = order.productId ? await findProductById(order.productId) : null

  // 이메일 재발송
  await sendCodeEmail({
    orderItemId: order.id,
    recipientEmail: order.buyerEmail,
    productName: order.productName,
    codeValue: code.codeValue,
    description: product?.description ?? null,
    caution: product?.caution ?? null,
    event: product?.event ?? null,
    paidAt: order.paidAt ?? order.createdAt,
  })

  // 코드 → sent, 주문 → completed
  await markCodeAsSent(code.id)
  await updateOrderItem(order.id, {
    fulfillmentStatus: 'completed',
    errorMessage: undefined,
  })

  await sendDiscordAlert(
    'order',
    `✅ 재시도 처리 완료\n상품: ${order.productName}\n수신자: ${order.buyerEmail}`,
  )
}
