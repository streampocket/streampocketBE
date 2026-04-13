import { findOrderById, updateReviewGameSentAt } from '../repositories/steamOrderRepository'
import { reserveReviewCodes } from '../repositories/reviewCodeRepository'
import { sendReviewGameAlimtalk } from './alimtalkService'
import { isAlimtalkEnabled } from './alimtalkService'
import { parseReviewGameCount } from '../utils/reviewGameParser'
import { sendDiscordAlert } from '../lib/discord'

export type SendReviewGameResult = {
  count: number
}

export async function sendReviewGame(orderItemId: string): Promise<SendReviewGameResult> {
  const order = await findOrderById(orderItemId)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  if (order.fulfillmentStatus !== 'completed') {
    throw Object.assign(new Error('처리 완료된 주문만 리뷰게임을 발송할 수 있습니다.'), { statusCode: 400 })
  }

  if (!order.decisionDate) {
    throw Object.assign(new Error('구매확정되지 않은 주문입니다.'), { statusCode: 400 })
  }

  if (order.reviewGameSentAt) {
    throw Object.assign(new Error('이미 리뷰게임이 발송된 주문입니다.'), { statusCode: 409 })
  }

  if (!order.receiverPhoneNumber) {
    throw Object.assign(new Error('수신자 전화번호가 없습니다.'), { statusCode: 400 })
  }

  const enabled = await isAlimtalkEnabled()
  if (!enabled) {
    throw Object.assign(new Error('알림톡이 비활성화되어 있습니다.'), { statusCode: 400 })
  }

  const reviewGameCount = parseReviewGameCount(order.productName)
  if (!reviewGameCount) {
    throw Object.assign(
      new Error('상품명에서 리뷰게임 수를 파싱할 수 없습니다. (예: "게임 1+7 지급" 패턴 필요)'),
      { statusCode: 400 },
    )
  }

  const codes = await reserveReviewCodes(reviewGameCount, order.receiverName ?? order.productOrderId)

  try {
    await sendReviewGameAlimtalk({
      orderItemId: order.id,
      recipientPhoneNumber: order.receiverPhoneNumber,
      recipientName: order.receiverName,
      productName: order.productName,
      codes: codes.map((c) => ({ gameName: c.gameName, code: c.code })),
    })

    await updateReviewGameSentAt(order.id)

    await sendDiscordAlert(
      'order',
      `🎮 리뷰게임 발송 완료\n상품: ${order.productName}\n코드 ${reviewGameCount}개 발송\n수신자: ${order.receiverPhoneNumber}`,
    ).catch(() => {})

    return { count: reviewGameCount }
  } catch (error) {
    await sendDiscordAlert(
      'error',
      `❌ 리뷰게임 발송 실패\n상품: ${order.productName}\n오류: ${error instanceof Error ? error.message : String(error)}`,
    ).catch(() => {})
    throw error
  }
}
