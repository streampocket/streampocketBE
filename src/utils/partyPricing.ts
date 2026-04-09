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

export function isPartyJoinable(product: PartyJoinableInput): { joinable: boolean; reason?: string } {
  if (product.status !== 'recruiting') {
    return { joinable: false, reason: '모집중인 파티만 신청할 수 있습니다.' }
  }

  if (product.filledSlots >= product.totalSlots) {
    return { joinable: false, reason: '모집이 마감되었습니다.' }
  }

  if (product.startedAt) {
    const remaining = getRemainingDays(product.startedAt, product.durationDays)
    if (remaining <= 1) {
      return { joinable: false, reason: '파티 남은 기간이 1일 이하로 신청이 불가합니다.' }
    }
  }

  return { joinable: true }
}
