import { FulfillmentStatus } from '@prisma/client'
import {
  listOrders,
  exportOrders,
  findOrderById,
  findOrderByProductOrderId,
  updateOrderItem,
  groupOrderCountsByStatus,
} from '../repositories/steamOrderRepository'
import { findAccountById, markAccountAsSent } from '../repositories/steamAccountRepository'
import { isAlimtalkEnabled, sendGiftCompletedAlimtalk, sendOrderAlimtalk } from './alimtalkService'
import { getSystemSettings } from './systemSettingsService'
import { sendDiscordAlert } from '../lib/discord'
import { detectProductType } from '../utils/productType'

// 진행중 주문 시간 연장 단위(분)
const EXTEND_MINUTES = 10

type ListOrdersInput = {
  status?: FulfillmentStatus
  from?: Date
  to?: Date
  receiverName?: string
  page: number
  pageSize: number
}

type ExportOrdersInput = {
  status?: FulfillmentStatus
  from?: Date
  to?: Date
}

type GetOrderCountsInput = {
  from?: Date
  to?: Date
  receiverName?: string
}

export async function getOrders(input: ListOrdersInput) {
  return listOrders(input)
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
    await updateOrderItem(order.id, { fulfillmentStatus: 'pending', errorMessage: undefined })
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
  await updateOrderItem(order.id, { fulfillmentStatus: 'pending', errorMessage: undefined })

  await sendDiscordAlert(
    'order',
    `✅ 재시도 처리 완료\n상품: ${order.productName}\n수신번호: ${order.receiverPhoneNumber}`,
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

  if (detectProductType(order.productName) !== 'AA') {
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

export async function markGiftCompleted(id: string): Promise<void> {
  const order = await findOrderById(id)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  if (detectProductType(order.productName) !== 'AA') {
    throw Object.assign(new Error('AA(선물형) 주문만 사용 가능합니다.'), { statusCode: 400 })
  }

  if (order.giftCompletedAt) {
    throw Object.assign(new Error('이미 선물 접수 완료 처리된 주문입니다.'), { statusCode: 400 })
  }

  if (!order.receiverPhoneNumber) {
    throw Object.assign(new Error('수신자 전화번호가 없어 알림톡을 전송할 수 없습니다.'), {
      statusCode: 400,
    })
  }

  await sendGiftCompletedAlimtalk({
    orderItemId: order.id,
    recipientPhoneNumber: order.receiverPhoneNumber,
    recipientName: order.receiverName,
  })

  await updateOrderItem(id, { giftCompletedAt: new Date() })

  await sendDiscordAlert(
    'order',
    `🎁 선물 접수 완료\n상품: ${order.productName}\n수신자명: ${order.receiverName ?? '미확인'}\n수신번호: ${order.receiverPhoneNumber}`,
  )
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

  // 구매확정 주문은 뱃지를 그대로 두고(구매확정) 발송완료 시각만 기록한다.
  // 대기/진행중 주문은 completed로 전환한다.
  await updateOrderItem(order.id, {
    completedAt: new Date(),
    ...(order.fulfillmentStatus === 'purchase_decided'
      ? {}
      : { fulfillmentStatus: 'completed' as const }),
  })
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
  }
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

  await sendDiscordAlert(
    'order',
    `📦 수동 반품 처리\n주문: ${order.productOrderId}\n상품: ${order.productName}`,
  )
}
