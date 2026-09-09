import { describe, expect, it } from 'vitest'
import {
  evaluatePartyReopen,
  isPartyNearExpiration,
  resolveApplicationExpiry,
  type PartyReopenInput,
} from './partyPricing'

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

describe('resolveApplicationExpiry', () => {
  const d = (iso: string) => new Date(iso)

  describe('기간 유지형(fixed) — 각자 전체 기간을 보장받는다', () => {
    it('승인시각 + 이용일수', () => {
      const expiry = resolveApplicationExpiry({
        approvedAt: d('2026-09-20T00:00:00Z'),
        durationDays: 30,
        durationMode: 'fixed',
        partyStartedAt: null,
      })
      expect(expiry.toISOString()).toBe('2026-10-20T00:00:00.000Z')
    })

    // fixed는 파티 startedAt을 세팅하지 않지만, 값이 있어도 자르지 않는다
    it('파티가 이미 시작돼 있어도 자르지 않는다', () => {
      const expiry = resolveApplicationExpiry({
        approvedAt: d('2026-09-20T00:00:00Z'),
        durationDays: 30,
        durationMode: 'fixed',
        partyStartedAt: d('2026-09-01T00:00:00Z'),
      })
      expect(expiry.toISOString()).toBe('2026-10-20T00:00:00.000Z')
    })
  })

  describe('기간 차감형(countdown) — 파티 종료일을 넘을 수 없다', () => {
    it('파티 시작 전이면 이 승인이 첫 승인이라 자르지 않는다', () => {
      const expiry = resolveApplicationExpiry({
        approvedAt: d('2026-09-01T00:00:00Z'),
        durationDays: 30,
        durationMode: 'countdown',
        partyStartedAt: null,
      })
      expect(expiry.toISOString()).toBe('2026-10-01T00:00:00.000Z')
    })

    // 핵심 케이스 — 9/1 시작 30일 파티(종료 10/1)에 9/20 승인
    it('늦게 참여하면 파티 종료일로 잘린다', () => {
      const expiry = resolveApplicationExpiry({
        approvedAt: d('2026-09-20T00:00:00Z'),
        durationDays: 30,
        durationMode: 'countdown',
        partyStartedAt: d('2026-09-01T00:00:00Z'),
      })
      expect(expiry.toISOString()).toBe('2026-10-01T00:00:00.000Z')
    })

    it('첫 승인자는 파티 종료일과 같아 변화가 없다', () => {
      const startedAt = d('2026-09-01T00:00:00Z')
      const expiry = resolveApplicationExpiry({
        approvedAt: startedAt,
        durationDays: 30,
        durationMode: 'countdown',
        partyStartedAt: startedAt,
      })
      expect(expiry.toISOString()).toBe('2026-10-01T00:00:00.000Z')
    })

    // 개인 만료가 파티 종료보다 이르면 자를 이유가 없다 (파티 시작이 미래인 비정상 데이터 방어)
    it('개인 만료가 파티 종료보다 이르면 그대로 둔다', () => {
      const expiry = resolveApplicationExpiry({
        approvedAt: d('2026-09-01T00:00:00Z'),
        durationDays: 30,
        durationMode: 'countdown',
        partyStartedAt: d('2026-09-10T00:00:00Z'),
      })
      expect(expiry.toISOString()).toBe('2026-10-01T00:00:00.000Z')
    })

    it('1초 차이도 정확히 잘린다 (경계)', () => {
      const expiry = resolveApplicationExpiry({
        approvedAt: d('2026-09-01T00:00:01Z'),
        durationDays: 30,
        durationMode: 'countdown',
        partyStartedAt: d('2026-09-01T00:00:00Z'),
      })
      expect(expiry.toISOString()).toBe('2026-10-01T00:00:00.000Z')
    })
  })
})
