import { FulfillmentStatus } from '@prisma/client'
import {
  listOrders,
  exportOrders,
  findOrderById,
  updateOrderItem,
} from '../repositories/steamOrderRepository'
import { findAccountById, markAccountAsSent } from '../repositories/steamAccountRepository'
import { isAlimtalkEnabled, sendOrderAlimtalk } from './alimtalkService'
import { sendDiscordAlert } from '../lib/discord'
import { detectProductType } from '../utils/productType'

type ListOrdersInput = {
  status?: FulfillmentStatus
  from?: Date
  to?: Date
  page: number
  pageSize: number
}

type ExportOrdersInput = {
  status?: FulfillmentStatus
  from?: Date
  to?: Date
}

export async function getOrders(input: ListOrdersInput) {
  return listOrders(input)
}

export async function exportOrdersForExcel(input: ExportOrdersInput) {
  return exportOrders(input)
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
    await sendOrderAlimtalk({
      productType: 'AA',
      orderItemId: order.id,
      recipientPhoneNumber: order.receiverPhoneNumber,
      recipientName: order.receiverName,
      productName: order.productName,
      paidAt: order.paidAt ?? order.createdAt,
    })
    await updateOrderItem(order.id, { fulfillmentStatus: 'completed', errorMessage: undefined })
    await sendDiscordAlert(
      'order',
      `✅ 재시도 처리 완료\n상품: ${order.productName}\n수신번호: ${order.receiverPhoneNumber}`,
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

  await sendOrderAlimtalk({
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
  })

  await markAccountAsSent(account.id)
  await updateOrderItem(order.id, { fulfillmentStatus: 'completed', errorMessage: undefined })

  await sendDiscordAlert(
    'order',
    `✅ 재시도 처리 완료\n상품: ${order.productName}\n수신번호: ${order.receiverPhoneNumber}`,
  )
}

export async function manualReturnOrder(id: string): Promise<void> {
  const order = await findOrderById(id)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  if (order.fulfillmentStatus === 'returned') {
    throw Object.assign(new Error('이미 반품 처리된 주문입니다.'), { statusCode: 400 })
  }

  if (order.fulfillmentStatus === 'pending') {
    throw Object.assign(new Error('아직 처리되지 않은 주문은 반품할 수 없습니다.'), {
      statusCode: 400,
    })
  }

  await updateOrderItem(order.id, {
    fulfillmentStatus: 'returned',
    returnedAt: new Date(),
  })

  await sendDiscordAlert(
    'order',
    `📦 수동 반품 처리\n주문: ${order.productOrderId}\n상품: ${order.productName}`,
  )
}
