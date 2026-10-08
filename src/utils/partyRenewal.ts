import { formatKstDateTime } from './kst'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export type RenewalDiscountSettings = {
  enabled: boolean
  amount: number
  /** DB `@db.Date` 값 — Prisma가 그 날짜의 UTC 자정 Date로 돌려준다. null이면 그쪽 경계 없음 */
  startDate: Date | null
  endDate: Date | null
}

/**
 * `@db.Date` 컬럼 값을 'YYYY-MM-DD'로. 저장된 달력 날짜가 UTC 자정으로 오므로 UTC 성분을 그대로 읽는다
 * (여기에 KST 변환을 하면 오히려 날짜가 밀린다 — 시각이 아니라 날짜만 담긴 값이기 때문).
 */
export function formatDbDate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 지금 재구매하면 받을 할인액.
 *
 * 켜져 있고 오늘(KST)이 기간 안이면 정액을 뺀다. 기간은 날짜 단위로 시작일 00:00~종료일 23:59(KST)를
 * 포함한다 — 'YYYY-MM-DD' 문자열은 사전순 비교가 곧 날짜 비교라 문자열로 비교한다.
 * 정가보다 크게 깎지 않는다(음수 결제액 방지).
 */
export function resolveRenewalDiscount(
  settings: RenewalDiscountSettings,
  price: number,
  now: Date = new Date(),
): number {
  if (!settings.enabled || settings.amount <= 0) return 0
  const today = formatKstDateTime(now).slice(0, 10)
  if (settings.startDate && today < formatDbDate(settings.startDate)) return 0
  if (settings.endDate && today > formatDbDate(settings.endDate)) return 0
  return Math.min(settings.amount, Math.max(0, price))
}

/**
 * 재구매 승인 시 늘어나는 구간.
 *
 * 이용 중에 승인하면 지금 만료일부터 이어 붙여 끊김이 없게 하고, 승인이 늦어 이미 만료일이 지났으면
 * 승인 시각부터 센다 — 구매자가 승인 대기 동안 놓친 날을 손해 보지 않게 하기 위함이다.
 * 만료일이 없는 비정상 건도 승인 시각부터 센다.
 */
export function resolveRenewalPeriod(
  currentExpiresAt: Date | null,
  approvedAt: Date,
  durationDays: number,
): { from: Date; to: Date } {
  const from =
    currentExpiresAt && currentExpiresAt.getTime() > approvedAt.getTime() ? currentExpiresAt : approvedAt
  return { from, to: new Date(from.getTime() + durationDays * MS_PER_DAY) }
}
