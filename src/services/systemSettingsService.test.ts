import { beforeEach, describe, expect, it, vi } from 'vitest'

const repo = vi.hoisted(() => ({
  getSystemSettingsRow: vi.fn(),
  upsertSystemSettings: vi.fn(),
}))

vi.mock('../repositories/systemSettingsRepository', () => repo)

const { getReviewPointTiers, getSystemSettings, updateSystemSettings } = await import(
  './systemSettingsService'
)

const ROW = {
  id: 'settings-1',
  defaultDurationMinutes: 60,
  reviewPointTier1Max: 7000,
  reviewPointTier2Max: 10000,
  reviewPointTier1Point: 100,
  reviewPointTier2Point: 200,
  reviewPointTier3Point: 300,
}

beforeEach(() => {
  vi.clearAllMocks()
  repo.getSystemSettingsRow.mockResolvedValue(ROW)
  repo.upsertSystemSettings.mockResolvedValue(ROW)
})

describe('리뷰 적립 구간 조회', () => {
  it('저장된 값을 그대로 돌려준다', async () => {
    const tiers = await getReviewPointTiers()
    expect(tiers).toEqual({
      tier1Max: 7000,
      tier2Max: 10000,
      tier1Point: 100,
      tier2Point: 200,
      tier3Point: 300,
    })
  })

  it('설정 행이 아직 없으면 기본값을 쓴다 (첫 배포 직후에도 적립이 동작해야 한다)', async () => {
    repo.getSystemSettingsRow.mockResolvedValue(null)

    const { reviewPointTiers, defaultDurationMinutes } = await getSystemSettings()

    expect(reviewPointTiers.tier1Point).toBe(100)
    expect(reviewPointTiers.tier3Point).toBe(300)
    expect(defaultDurationMinutes).toBe(60)
  })
})

describe('구간 저장 검증', () => {
  const tiers = {
    tier1Max: 7000,
    tier2Max: 10000,
    tier1Point: 100,
    tier2Point: 200,
    tier3Point: 300,
  }

  it('정상 값은 저장된다', async () => {
    await updateSystemSettings({ reviewPointTiers: tiers })
    expect(repo.upsertSystemSettings).toHaveBeenCalledWith(
      expect.objectContaining({ reviewPointTier1Max: 7000, reviewPointTier2Max: 10000 }),
    )
  })

  it('경계가 역전되면 막는다 — 2구간이 영영 안 나가는 설정이다', async () => {
    await expect(
      updateSystemSettings({ reviewPointTiers: { ...tiers, tier1Max: 10000, tier2Max: 7000 } }),
    ).rejects.toMatchObject({ statusCode: 400 })
    expect(repo.upsertSystemSettings).not.toHaveBeenCalled()
  })

  it('경계가 같아도 막는다 (1구간이 2구간을 통째로 먹는다)', async () => {
    await expect(
      updateSystemSettings({ reviewPointTiers: { ...tiers, tier1Max: 8000, tier2Max: 8000 } }),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('소요시간만 단독으로 바꿀 수 있다 (구간 설정과 화면이 다르다)', async () => {
    await updateSystemSettings({ defaultDurationMinutes: 90 })
    expect(repo.upsertSystemSettings).toHaveBeenCalledWith({ defaultDurationMinutes: 90 })
  })
})
