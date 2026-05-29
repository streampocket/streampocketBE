import {
  RegistrationWithOrder,
  findRegistrationByOrderItemId,
} from '../repositories/steamRegistrationRepository'

// 주문 상세 모달용 — 연결된 접수가 없으면 null (오류 아님).
// 자동 친구링크 폼이 기존 자격증명을 프리필하는 데 사용된다.
export async function getRegistrationByOrderItem(
  orderItemId: string,
): Promise<RegistrationWithOrder | null> {
  return findRegistrationByOrderItemId(orderItemId)
}
