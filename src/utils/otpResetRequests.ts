import type { OwnProductType } from '@prisma/client'

// 관리자 상단 종 — OTP 재발급 미처리 요청 1건 (초기화는 orderId로 기존 주문 API를 호출한다)
export type OtpResetRequestItem = {
  applicationId: string
  /** 원 신청 주문 id — 없으면(기능 도입 전 신청 등) 종에서 초기화할 수 없다 */
  orderId: string | null
  productOrderId: string | null
  productName: string
  partyType: OwnProductType
  userName: string | null
  userPhone: string | null
  requestedAt: Date
  expiresAt: Date
}

type PendingCredential = {
  applicationId: string
  resetRequestedAt: Date | null
  application: {
    expiresAt: Date | null
    user: { name: string | null; phone: string | null } | null
    product: { name: string; partyType: OwnProductType }
  }
}

type OriginalOrder = {
  id: string
  productOrderId: string
  partyApplicationId: string | null
}

/**
 * 요청 목록과 원 신청 주문을 합친다. 입력 순서(요청 오래된 순)를 유지한다.
 * 한 신청에 주문이 여럿이면(반품 후 재생성 등) 가장 먼저 생긴 주문을 쓴다 — orders는 createdAt 오름차순으로 받는다.
 */
export function buildOtpResetRequestItems(
  credentials: PendingCredential[],
  orders: OriginalOrder[],
): OtpResetRequestItem[] {
  const orderByApplication = new Map<string, OriginalOrder>()
  for (const order of orders) {
    if (order.partyApplicationId && !orderByApplication.has(order.partyApplicationId)) {
      orderByApplication.set(order.partyApplicationId, order)
    }
  }

  return credentials.flatMap((credential) => {
    const { resetRequestedAt } = credential
    const { expiresAt } = credential.application
    // 조회 조건상 둘 다 있지만, 타입상 null 가능 — 없으면 표시할 수 없으므로 건너뛴다
    if (!resetRequestedAt || !expiresAt) return []
    const order = orderByApplication.get(credential.applicationId)
    return [
      {
        applicationId: credential.applicationId,
        orderId: order?.id ?? null,
        productOrderId: order?.productOrderId ?? null,
        productName: credential.application.product.name,
        partyType: credential.application.product.partyType,
        userName: credential.application.user?.name ?? null,
        userPhone: credential.application.user?.phone ?? null,
        requestedAt: resetRequestedAt,
        expiresAt,
      },
    ]
  })
}
