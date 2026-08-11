import { getSystemSettingsRow, upsertSystemSettings } from '../repositories/systemSettingsRepository'

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

type SystemSettingsResult = {
  defaultDurationMinutes: number
  reviewPointTiers: ReviewPointTiers
}

export async function getSystemSettings(): Promise<SystemSettingsResult> {
  const row = await getSystemSettingsRow()
  return {
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

  return getSystemSettings()
}
