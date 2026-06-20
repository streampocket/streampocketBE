import { describe, expect, it } from 'vitest'
import {
  evaluateReturnedRecovery,
  hasActiveCancelOrReturnClaim,
} from './steamFulfillmentService'
import type { ClaimSnapshot } from './steamFulfillmentService'

/**
 * 네이버 주문 "대기 ↔ 취소처리" 토글 버그 회귀 방지 테스트.
 * 복구 판정 순수 함수(evaluateReturnedRecovery / hasActiveCancelOrReturnClaim)의 규칙을 고정한다.
 */

const snapshot = (over: Partial<ClaimSnapshot>): ClaimSnapshot => ({
  productOrderStatus: null,
  claimType: null,
  claimStatus: null,
  ...over,
})

describe('hasActiveCancelOrReturnClaim', () => {
  it('취소 진행 중(PAYED + CANCEL)은 활성 클레임 → true', () => {
    expect(
      hasActiveCancelOrReturnClaim(
        snapshot({ productOrderStatus: 'PAYED', claimType: 'CANCEL', claimStatus: null }),
      ),
    ).toBe(true)
  })

  it('반품 진행 중(DELIVERED + RETURN)은 활성 클레임 → true', () => {
    expect(
      hasActiveCancelOrReturnClaim(
        snapshot({ productOrderStatus: 'DELIVERED', claimType: 'RETURN' }),
      ),
    ).toBe(true)
  })

  it('취소 확정(CANCELED)은 활성 클레임 아님 → false', () => {
    expect(
      hasActiveCancelOrReturnClaim(
        snapshot({ productOrderStatus: 'CANCELED', claimType: 'CANCEL' }),
      ),
    ).toBe(false)
  })

  it('클레임 없음(claimType null)은 활성 클레임 아님 → false', () => {
    expect(
      hasActiveCancelOrReturnClaim(snapshot({ productOrderStatus: 'PAYED', claimType: null })),
    ).toBe(false)
  })

  it('교환(EXCHANGE)은 복구 차단 대상 아님 → false', () => {
    expect(
      hasActiveCancelOrReturnClaim(
        snapshot({ productOrderStatus: 'PAYED', claimType: 'EXCHANGE' }),
      ),
    ).toBe(false)
  })
})

describe('evaluateReturnedRecovery', () => {
  it('토글 재현 케이스: PAYED + CANCEL + claimStatus=null → 복구 안 함', () => {
    expect(
      evaluateReturnedRecovery(
        snapshot({ productOrderStatus: 'PAYED', claimType: 'CANCEL', claimStatus: null }),
        null,
      ),
    ).toEqual({ recover: false })
  })

  it('PAYED + CANCEL + 임의 진행값 → 복구 안 함', () => {
    expect(
      evaluateReturnedRecovery(
        snapshot({ productOrderStatus: 'PAYED', claimType: 'CANCEL', claimStatus: 'CANCEL_REQUESTED' }),
        null,
      ),
    ).toEqual({ recover: false })
  })

  it('CANCELED + CANCEL(취소 확정) → 복구 안 함(returned 유지)', () => {
    expect(
      evaluateReturnedRecovery(
        snapshot({ productOrderStatus: 'CANCELED', claimType: 'CANCEL' }),
        null,
      ),
    ).toEqual({ recover: false })
  })

  it('고객 철회: PAYED + claimType=null → 대기로 복구', () => {
    expect(
      evaluateReturnedRecovery(snapshot({ productOrderStatus: 'PAYED', claimType: null }), null),
    ).toEqual({ recover: true, status: 'pending' })
  })

  it('PURCHASE_DECIDED + claimType=null → 구매확정으로 복구', () => {
    expect(
      evaluateReturnedRecovery(
        snapshot({ productOrderStatus: 'PURCHASE_DECIDED', claimType: null }),
        null,
      ),
    ).toEqual({ recover: true, status: 'purchase_decided' })
  })

  it('PAYED + claimType=null + 발송완료 기록 있음 → 완료로 복구', () => {
    expect(
      evaluateReturnedRecovery(
        snapshot({ productOrderStatus: 'PAYED', claimType: null }),
        new Date('2026-06-20T00:00:00+09:00'),
      ),
    ).toEqual({ recover: true, status: 'completed' })
  })

  it('DELIVERED + RETURN(반품 진행 중) → 복구 안 함', () => {
    expect(
      evaluateReturnedRecovery(
        snapshot({ productOrderStatus: 'DELIVERED', claimType: 'RETURN' }),
        null,
      ),
    ).toEqual({ recover: false })
  })

  it('productOrderStatus 없음 → 복구 안 함', () => {
    expect(evaluateReturnedRecovery(snapshot({ productOrderStatus: null }), null)).toEqual({
      recover: false,
    })
  })
})
