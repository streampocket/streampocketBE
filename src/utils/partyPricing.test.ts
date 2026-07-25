import { describe, expect, it } from 'vitest'
import { evaluatePartyReopen, isPartyNearExpiration, type PartyReopenInput } from './partyPricing'

const MS_PER_DAY = 24 * 60 * 60 * 1000

// 지금부터 remainingDays만큼 남도록 startedAt을 역산
function startedAtWithRemaining(remainingDays: number, durationDays: number): Date {
  return new Date(Date.now() - (durationDays - remainingDays) * MS_PER_DAY)
}

describe('isPartyNearExpiration', () => {
  it('startedAt이 null이면 근접 만료가 아니다 (유지형·첫 승인 전)', () => {
    expect(isPartyNearExpiration(null, 30)).toBe(false)
  })

  it('남은 기간이 1일 초과면 false', () => {
    expect(isPartyNearExpiration(startedAtWithRemaining(1.5, 30), 30)).toBe(false)
  })

  it('남은 기간이 1일 이하면 true', () => {
    expect(isPartyNearExpiration(startedAtWithRemaining(0.5, 30), 30)).toBe(true)
  })

  it('이미 만료된(음수) 파티도 true', () => {
    expect(isPartyNearExpiration(startedAtWithRemaining(-3, 30), 30)).toBe(true)
  })
})

const baseClosedFull: PartyReopenInput = {
  status: 'closed',
  deletedAt: null,
  filledSlots: 2,
  totalSlots: 2,
  startedAt: startedAtWithRemaining(10, 30),
  durationDays: 30,
}

describe('evaluatePartyReopen', () => {
  it('정원을 채워 닫힌 파티에서 자리가 나면 복귀한다', () => {
    expect(evaluatePartyReopen(baseClosedFull, 1)).toBe(true)
  })

  it('startedAt이 null인 유지형 파티도 복귀한다', () => {
    expect(evaluatePartyReopen({ ...baseClosedFull, startedAt: null }, 1)).toBe(true)
  })

  it('남은 기간 1일 이하면 복귀하지 않는다 (크론 마감 정책과 충돌 방지)', () => {
    const nearExpiry = { ...baseClosedFull, startedAt: startedAtWithRemaining(0.5, 30) }
    expect(evaluatePartyReopen(nearExpiry, 1)).toBe(false)
  })

  it('관리자가 정원 미충족 상태에서 수동 마감한 파티는 복귀하지 않는다', () => {
    expect(evaluatePartyReopen({ ...baseClosedFull, filledSlots: 1 }, 0)).toBe(false)
  })

  it('이미 모집중인 파티는 대상이 아니다', () => {
    expect(evaluatePartyReopen({ ...baseClosedFull, status: 'recruiting' }, 1)).toBe(false)
  })

  it('만료된 파티는 복귀하지 않는다', () => {
    expect(evaluatePartyReopen({ ...baseClosedFull, status: 'expired' }, 1)).toBe(false)
  })

  it('삭제된 파티는 복귀하지 않는다', () => {
    expect(evaluatePartyReopen({ ...baseClosedFull, deletedAt: new Date() }, 1)).toBe(false)
  })

  it('감소 후에도 정원이 그대로 차 있으면 복귀하지 않는다 (슬롯 감소 실패 케이스)', () => {
    expect(evaluatePartyReopen(baseClosedFull, 2)).toBe(false)
  })
})
