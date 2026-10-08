import { describe, expect, it } from 'vitest'
import { formatDbDate, resolveRenewalDiscount, resolveRenewalPeriod } from './partyRenewal'

/**
 * 재구매 할인·연장 기간 규칙 고정 테스트.
 * 할인: 켜짐 + KST 오늘이 [시작일, 종료일] 안 → 정액(정가 상한). 연장: max(현재 만료, 승인 시각) + 기간.
 */

// @db.Date 값은 Prisma가 그 날짜의 UTC 자정으로 준다
const dbDate = (ymd: string) => new Date(`${ymd}T00:00:00.000Z`)
// KST 시각을 명시해 만든다
const kst = (iso: string) => new Date(`${iso}+09:00`)

const base = { enabled: true, amount: 1000, startDate: null, endDate: null }

describe('formatDbDate', () => {
  it('UTC 자정 Date를 그 달력 날짜로', () => {
    expect(formatDbDate(dbDate('2026-10-08'))).toBe('2026-10-08')
  })
})

describe('resolveRenewalDiscount', () => {
  it('꺼져 있으면 0', () => {
    expect(resolveRenewalDiscount({ ...base, enabled: false }, 9000)).toBe(0)
  })

  it('금액이 0 이하면 0', () => {
    expect(resolveRenewalDiscount({ ...base, amount: 0 }, 9000)).toBe(0)
  })

  it('기간 없이 켜 두면 항상 적용', () => {
    expect(resolveRenewalDiscount(base, 9000, kst('2026-10-08T12:00:00'))).toBe(1000)
  })

  it('정가보다 크게 깎지 않는다', () => {
    expect(resolveRenewalDiscount({ ...base, amount: 20000 }, 9000)).toBe(9000)
  })

  it('시작일 당일 00:00(KST)부터 적용, 전날 23:59는 미적용', () => {
    const s = { ...base, startDate: dbDate('2026-10-10') }
    expect(resolveRenewalDiscount(s, 9000, kst('2026-10-09T23:59:59'))).toBe(0)
    expect(resolveRenewalDiscount(s, 9000, kst('2026-10-10T00:00:00'))).toBe(1000)
  })

  it('종료일 당일 23:59(KST)까지 적용, 다음날 00:00은 미적용', () => {
    const s = { ...base, endDate: dbDate('2026-10-12') }
    expect(resolveRenewalDiscount(s, 9000, kst('2026-10-12T23:59:59'))).toBe(1000)
    expect(resolveRenewalDiscount(s, 9000, kst('2026-10-13T00:00:00'))).toBe(0)
  })

  it('UTC로는 전날이어도 KST 날짜 기준으로 판정', () => {
    // KST 10/10 08:00 = UTC 10/09 23:00 → 시작일 10/10이면 적용돼야 한다
    const s = { ...base, startDate: dbDate('2026-10-10') }
    expect(resolveRenewalDiscount(s, 9000, kst('2026-10-10T08:00:00'))).toBe(1000)
  })
})

describe('resolveRenewalPeriod', () => {
  const day = 24 * 60 * 60 * 1000

  it('만료 전 승인 → 현재 만료일부터 이어 붙인다', () => {
    const expires = kst('2026-10-31T10:00:00')
    const approved = kst('2026-10-25T15:00:00')
    const { from, to } = resolveRenewalPeriod(expires, approved, 30)
    expect(from.getTime()).toBe(expires.getTime())
    expect(to.getTime()).toBe(expires.getTime() + 30 * day)
  })

  it('만료 후 승인 → 승인 시각부터 센다', () => {
    const expires = kst('2026-10-31T10:00:00')
    const approved = kst('2026-11-02T09:00:00')
    const { from, to } = resolveRenewalPeriod(expires, approved, 30)
    expect(from.getTime()).toBe(approved.getTime())
    expect(to.getTime()).toBe(approved.getTime() + 30 * day)
  })

  it('만료일이 없으면 승인 시각부터', () => {
    const approved = kst('2026-11-02T09:00:00')
    expect(resolveRenewalPeriod(null, approved, 7).from.getTime()).toBe(approved.getTime())
  })
})
