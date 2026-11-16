import { describe, expect, it } from 'vitest'
import { buildOtpResetRequestItems } from './otpResetRequests'

const EXPIRES = new Date('2026-12-01T00:00:00Z')

function credential(applicationId: string, requestedAt: string) {
  return {
    applicationId,
    resetRequestedAt: new Date(requestedAt),
    application: {
      expiresAt: EXPIRES,
      user: { name: '홍길동', phone: '01012345678' },
      product: { name: '넷플릭스 30일', partyType: 'personal' as const },
    },
  }
}

describe('OTP 재발급 요청 알림 목록 조립', () => {
  it('신청마다 원 신청 주문을 붙이고 입력 순서(요청 오래된 순)를 유지한다', () => {
    const items = buildOtpResetRequestItems(
      [credential('app-1', '2026-11-16T01:00:00Z'), credential('app-2', '2026-11-16T02:00:00Z')],
      [
        { id: 'order-2', productOrderId: 'P2', partyApplicationId: 'app-2' },
        { id: 'order-1', productOrderId: 'P1', partyApplicationId: 'app-1' },
      ],
    )
    expect(items.map((item) => [item.applicationId, item.orderId, item.productOrderId])).toEqual([
      ['app-1', 'order-1', 'P1'],
      ['app-2', 'order-2', 'P2'],
    ])
    expect(items[0]).toMatchObject({
      productName: '넷플릭스 30일',
      partyType: 'personal',
      userName: '홍길동',
      expiresAt: EXPIRES,
    })
  })

  it('연결된 주문이 없으면 orderId null (화면에서 초기화 버튼 비활성)', () => {
    const [item] = buildOtpResetRequestItems([credential('app-1', '2026-11-16T01:00:00Z')], [])
    expect(item.orderId).toBeNull()
    expect(item.productOrderId).toBeNull()
  })

  it('한 신청에 주문이 여럿이면 먼저 받은(가장 오래된) 주문을 쓴다', () => {
    const [item] = buildOtpResetRequestItems(
      [credential('app-1', '2026-11-16T01:00:00Z')],
      [
        { id: 'order-old', productOrderId: 'OLD', partyApplicationId: 'app-1' },
        { id: 'order-new', productOrderId: 'NEW', partyApplicationId: 'app-1' },
      ],
    )
    expect(item.orderId).toBe('order-old')
  })

  it('탈퇴 회원(user null)도 목록에 남는다', () => {
    const base = credential('app-1', '2026-11-16T01:00:00Z')
    const [item] = buildOtpResetRequestItems(
      [{ ...base, application: { ...base.application, user: null } }],
      [],
    )
    expect(item.userName).toBeNull()
  })

  it('요청 시각·만료일이 없는 행은 건너뛴다 (조회 조건상 생기지 않지만 방어)', () => {
    const base = credential('app-1', '2026-11-16T01:00:00Z')
    const items = buildOtpResetRequestItems(
      [
        { ...base, resetRequestedAt: null },
        { ...base, applicationId: 'app-2', application: { ...base.application, expiresAt: null } },
      ],
      [],
    )
    expect(items).toEqual([])
  })
})
