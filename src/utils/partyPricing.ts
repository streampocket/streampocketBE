const MS_PER_DAY = 24 * 60 * 60 * 1000

type PartyPricingInput = {
  price: number
  dailyDiscount: number
  durationDays: number
  startedAt: Date | null
}

type PartyJoinableInput = PartyPricingInput & {
  filledSlots: number
  totalSlots: number
  status: string
}

export function calculatePartyExpiresAt(startedAt: Date, durationDays: number): Date {
  return new Date(startedAt.getTime() + durationDays * MS_PER_DAY)
}

export function getRemainingDays(startedAt: Date, durationDays: number): number {
  const expiresAt = calculatePartyExpiresAt(startedAt, durationDays)
  return (expiresAt.getTime() - Date.now()) / MS_PER_DAY
}

export function calculateCurrentPrice(input: PartyPricingInput): number {
  if (!input.startedAt || input.dailyDiscount <= 0) return input.price
  const elapsedMs = Date.now() - input.startedAt.getTime()
  const elapsedDays = Math.floor(elapsedMs / MS_PER_DAY)
  return Math.max(0, input.price - elapsedDays * input.dailyDiscount)
}

// 남은 기간이 1일 이하인지 — 신청 차단(isPartyJoinable)과 크론 자동 마감의 공통 기준.
// startedAt이 null이면(유지형 fixed / 첫 승인 전) 카운트다운이 없으므로 근접 만료가 아니다.
export function isPartyNearExpiration(startedAt: Date | null, durationDays: number): boolean {
  if (!startedAt) return false
  return getRemainingDays(startedAt, durationDays) <= 1
}

export function isPartyJoinable(product: PartyJoinableInput): { joinable: boolean; reason?: string } {
  if (product.status !== 'recruiting') {
    return { joinable: false, reason: '모집중인 파티만 신청할 수 있습니다.' }
  }

  if (product.filledSlots >= product.totalSlots) {
    return { joinable: false, reason: '모집이 마감되었습니다.' }
  }

  if (isPartyNearExpiration(product.startedAt, product.durationDays)) {
    return { joinable: false, reason: '파티 남은 기간이 1일 이하로 신청이 불가합니다.' }
  }

  return { joinable: true }
}

export type PartyReopenInput = {
  status: string
  deletedAt: Date | null
  filledSlots: number
  totalSlots: number
  startedAt: Date | null
  durationDays: number
}

// 파티원 제거 후 모집완료(closed) → 모집중(recruiting) 복귀 여부 판정.
// - 정원을 채워서 닫힌 파티만 대상 (관리자가 수동으로 마감한 파티는 되살리지 않는다)
// - 남은 기간 1일 이하는 제외 — 크론이 "잔여 1일 이하 recruiting → closed"로 마감하므로 되살리면 충돌
export function evaluatePartyReopen(before: PartyReopenInput, afterFilledSlots: number): boolean {
  if (before.status !== 'closed') return false
  if (before.deletedAt) return false
  if (before.filledSlots < before.totalSlots) return false
  if (afterFilledSlots >= before.totalSlots) return false
  return !isPartyNearExpiration(before.startedAt, before.durationDays)
}
