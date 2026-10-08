import { getSystemSettingsRow, upsertSystemSettings } from '../repositories/systemSettingsRepository'
import { formatDbDate, type RenewalDiscountSettings } from '../utils/partyRenewal'

// 진행중 전환 시 적용하는 전역 기본 소요시간(분) — 선택 가능한 값 목록
export const ALLOWED_DURATION_MINUTES: readonly number[] = [20, 40, 60, 90, 120]

// 설정 행이 없을 때 사용하는 기본값
const DEFAULT_DURATION_MINUTES = 60

// 리뷰 적립 포인트 기본 구간 — 스키마 @default와 같은 값이어야 한다 (설정 행이 없을 때 쓰인다)
const DEFAULT_REVIEW_POINT_TIERS: ReviewPointTiers = {
  tier1Max: 7000,
  tier2Max: 10000,
  tier1Point: 100,
  tier2Point: 200,
  tier3Point: 300,
}

/** 실결제액 기준 3구간. 구간 개수는 3으로 고정이라 표 편집기 없이 숫자 5개로 관리한다 */
export type ReviewPointTiers = {
  /** 이 금액 이하 → tier1Point */
  tier1Max: number
  /** 이 금액 이하 → tier2Point */
  tier2Max: number
  tier1Point: number
  tier2Point: number
  /** tier2Max 초과 → tier3Point */
  tier3Point: number
}

/** 재구매 할인 이벤트 — 화면·API용. 날짜는 KST 달력 날짜 'YYYY-MM-DD', 비우면 null */
export type RenewalDiscountView = {
  enabled: boolean
  amount: number
  startDate: string | null
  endDate: string | null
}

type SystemSettingsResult = {
  defaultDurationMinutes: number
  reviewPointTiers: ReviewPointTiers
  /** 파티 승인 시 계정 자동 배정 (승인 모달 토글의 기본값) */
  partyAutoAssignEnabled: boolean
  renewalDiscount: RenewalDiscountView
}

const DEFAULT_RENEWAL_DISCOUNT: RenewalDiscountSettings = {
  enabled: false,
  amount: 0,
  startDate: null,
  endDate: null,
}

/** 할인 계산에서만 쓰는 좁은 조회 — 날짜는 DB Date 그대로 (resolveRenewalDiscount 입력 형태) */
export async function getRenewalDiscountSettings(): Promise<RenewalDiscountSettings> {
  const row = await getSystemSettingsRow()
  if (!row) return DEFAULT_RENEWAL_DISCOUNT
  return {
    enabled: row.renewalDiscountEnabled,
    amount: row.renewalDiscountAmount,
    startDate: row.renewalDiscountStartDate,
    endDate: row.renewalDiscountEndDate,
  }
}

export async function getSystemSettings(): Promise<SystemSettingsResult> {
  const row = await getSystemSettingsRow()
  return {
    partyAutoAssignEnabled: row?.partyAutoAssignEnabled ?? false,
    renewalDiscount: {
      enabled: row?.renewalDiscountEnabled ?? false,
      amount: row?.renewalDiscountAmount ?? 0,
      startDate: row?.renewalDiscountStartDate ? formatDbDate(row.renewalDiscountStartDate) : null,
      endDate: row?.renewalDiscountEndDate ? formatDbDate(row.renewalDiscountEndDate) : null,
    },
    defaultDurationMinutes: row?.defaultDurationMinutes ?? DEFAULT_DURATION_MINUTES,
    reviewPointTiers: row
      ? {
          tier1Max: row.reviewPointTier1Max,
          tier2Max: row.reviewPointTier2Max,
          tier1Point: row.reviewPointTier1Point,
          tier2Point: row.reviewPointTier2Point,
          tier3Point: row.reviewPointTier3Point,
        }
      : DEFAULT_REVIEW_POINT_TIERS,
  }
}

/** 적립 계산에서만 쓰는 좁은 조회 — 설정 전체를 끌고 다니지 않는다 */
export async function getReviewPointTiers(): Promise<ReviewPointTiers> {
  const { reviewPointTiers } = await getSystemSettings()
  return reviewPointTiers
}

const badRequest = (message: string) => Object.assign(new Error(message), { statusCode: 400 })

export async function updateSystemSettings(input: {
  defaultDurationMinutes?: number
  reviewPointTiers?: ReviewPointTiers
  partyAutoAssignEnabled?: boolean
  renewalDiscount?: RenewalDiscountView
}): Promise<SystemSettingsResult> {
  if (input.reviewPointTiers) {
    const tiers = input.reviewPointTiers
    // 경계가 뒤집히면 2구간이 영영 안 나간다 (1구간이 2구간 범위를 통째로 먹는다)
    if (tiers.tier1Max >= tiers.tier2Max) {
      throw badRequest('1구간 상한은 2구간 상한보다 작아야 합니다.')
    }
    await upsertSystemSettings({
      reviewPointTier1Max: tiers.tier1Max,
      reviewPointTier2Max: tiers.tier2Max,
      reviewPointTier1Point: tiers.tier1Point,
      reviewPointTier2Point: tiers.tier2Point,
      reviewPointTier3Point: tiers.tier3Point,
    })
  }

  if (input.defaultDurationMinutes !== undefined) {
    await upsertSystemSettings({ defaultDurationMinutes: input.defaultDurationMinutes })
  }

  if (input.partyAutoAssignEnabled !== undefined) {
    await upsertSystemSettings({ partyAutoAssignEnabled: input.partyAutoAssignEnabled })
  }

  if (input.renewalDiscount) {
    const discount = input.renewalDiscount
    // 'YYYY-MM-DD'는 사전순 = 날짜순. 뒤집히면 할인이 영영 적용되지 않는다
    if (discount.startDate && discount.endDate && discount.startDate > discount.endDate) {
      throw badRequest('할인 시작일은 종료일보다 늦을 수 없습니다.')
    }
    await upsertSystemSettings({
      renewalDiscountEnabled: discount.enabled,
      renewalDiscountAmount: discount.amount,
      // @db.Date는 달력 날짜만 저장한다 — UTC 자정 Date로 넘겨야 날짜가 밀리지 않는다
      renewalDiscountStartDate: discount.startDate ? new Date(`${discount.startDate}T00:00:00.000Z`) : null,
      renewalDiscountEndDate: discount.endDate ? new Date(`${discount.endDate}T00:00:00.000Z`) : null,
    })
  }

  return getSystemSettings()
}
