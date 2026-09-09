import type { PartyDurationMode } from '@prisma/client'

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

export type ApplicationExpiryInput = {
  /** 승인 시각 (기존 건은 PartyApplication.startedAt에 남아 있다) */
  approvedAt: Date
  durationDays: number
  durationMode: PartyDurationMode
  /** 파티의 공유 시작 시각 — countdown에서 첫 승인 때만 세팅된다. null이면 아직 시작 전 */
  partyStartedAt: Date | null
}

/**
 * 이 신청의 실제 이용 만료 시각.
 *
 * fixed(기간 유지형)는 각 참여자가 durationDays를 온전히 보장받으므로 승인시각 + durationDays.
 *
 * countdown(기간 차감형)은 파티 전체가 "첫 승인시각 + durationDays"에 끝나므로
 * 늦게 들어온 사람이 그 종료일을 넘을 수 없다 — 남은 기간만큼 값을 깎아 파는 구조
 * (calculateCurrentPrice)와 짝이 맞아야 한다.
 * 예: 30일 파티가 9/1에 시작(종료 10/1)했고 9/20에 승인되면 만료는 10/20이 아니라 10/1이다.
 *
 * 파티가 아직 시작 전(partyStartedAt null)이면 이 승인이 첫 승인이라 자를 대상이 없다.
 */
export function resolveApplicationExpiry(input: ApplicationExpiryInput): Date {
  const individualExpiry = new Date(input.approvedAt.getTime() + input.durationDays * MS_PER_DAY)
  if (input.durationMode !== 'countdown' || !input.partyStartedAt) return individualExpiry

  const partyExpiry = calculatePartyExpiresAt(input.partyStartedAt, input.durationDays)
  return partyExpiry.getTime() < individualExpiry.getTime() ? partyExpiry : individualExpiry
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
