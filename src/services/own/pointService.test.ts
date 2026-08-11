import { beforeEach, describe, expect, it, vi } from 'vitest'

// 저장소는 모킹한다 — 여기서 고정하려는 건 DB 동작이 아니라
// "얼마를 언제 주고 빼는가", "언제 두 번 주지 않는가"라는 판단 규칙이다.
const repo = vi.hoisted(() => ({
  findUserPointBalance: vi.fn(),
  decrementPointIfEnough: vi.fn(),
  incrementPoint: vi.fn(),
  decrementPointToZero: vi.fn(),
  createPointTransaction: vi.fn(),
  hasReviewReward: vi.fn(),
  findReviewRewardAmount: vi.fn(),
  findRefundableAmount: vi.fn(),
}))

vi.mock('../../repositories/own/pointRepository', () => repo)

const settings = vi.hoisted(() => ({ getReviewPointTiers: vi.fn() }))
vi.mock('../systemSettingsService', () => settings)

const {
  grantReviewReward,
  refundApplicationPoint,
  resolveReviewReward,
  revokeReviewReward,
  usePointForApplication,
} = await import('./pointService')

const TIERS = { tier1Max: 7000, tier2Max: 10000, tier1Point: 100, tier2Point: 200, tier3Point: 300 }

// 모킹 대상이 아닌 인자 — 실제 트랜잭션 클라이언트 자리
const db = {} as never

beforeEach(() => {
  vi.clearAllMocks()
  settings.getReviewPointTiers.mockResolvedValue(TIERS)
  repo.hasReviewReward.mockResolvedValue(false)
  repo.incrementPoint.mockResolvedValue({ pointBalance: 0 })
  repo.createPointTransaction.mockResolvedValue({})
  repo.decrementPointIfEnough.mockResolvedValue(true)
  repo.findUserPointBalance.mockResolvedValue(0)
})

describe('적립 구간 판정', () => {
  it.each([
    [0, 100],
    [3800, 100],
    [7000, 100], // 경계 포함 — 이하가 1구간
    [7001, 200],
    [9800, 200],
    [10000, 200], // 경계 포함 — 이하가 2구간
    [10001, 300],
    [76300, 300], // 고액도 300P — 구간이 상한을 겸한다
  ])('실결제 %i원 → %iP', (paid, expected) => {
    expect(resolveReviewReward(paid, TIERS)).toBe(expected)
  })

  it('구간을 바꾸면 판정도 따라 바뀐다', () => {
    const custom = { ...TIERS, tier1Max: 5000, tier1Point: 50 }
    expect(resolveReviewReward(5000, custom)).toBe(50)
    expect(resolveReviewReward(5001, custom)).toBe(200)
  })
})

describe('리뷰 적립', () => {
  it('실결제액(총액 − 사용 포인트) 기준으로 지급한다', async () => {
    repo.incrementPoint.mockResolvedValue({ pointBalance: 1200 })

    // 총액 12,000원이지만 포인트로 3,000원을 깎아 실결제는 9,000원 → 2구간
    const { granted } = await grantReviewReward(db, {
      userId: 'u1',
      reviewId: 'r1',
      paidAmount: 9000,
    })

    expect(granted).toBe(200)
    expect(repo.incrementPoint).toHaveBeenCalledWith(db, 'u1', 200)
  })

  it('같은 리뷰에 이미 지급했으면 다시 주지 않는다 (삭제 후 재작성 방어)', async () => {
    repo.hasReviewReward.mockResolvedValue(true)

    const { granted } = await grantReviewReward(db, {
      userId: 'u1',
      reviewId: 'r1',
      paidAmount: 20000,
    })

    expect(granted).toBe(0)
    expect(repo.incrementPoint).not.toHaveBeenCalled()
  })

  it('지급액이 0인 구간이면 이력도 남기지 않는다', async () => {
    settings.getReviewPointTiers.mockResolvedValue({ ...TIERS, tier1Point: 0 })

    const { granted } = await grantReviewReward(db, { userId: 'u1', reviewId: 'r1', paidAmount: 3000 })

    expect(granted).toBe(0)
    expect(repo.createPointTransaction).not.toHaveBeenCalled()
  })
})

describe('리뷰 삭제 회수', () => {
  it('지급했던 금액만큼 깎는다', async () => {
    repo.findReviewRewardAmount.mockResolvedValue(300)
    repo.decrementPointToZero.mockResolvedValue({ revoked: 300, balanceAfter: 700 })

    const { revoked } = await revokeReviewReward(db, { userId: 'u1', reviewId: 'r1' })

    expect(revoked).toBe(300)
    expect(repo.decrementPointToZero).toHaveBeenCalledWith(db, 'u1', 300)
  })

  it('이미 써서 잔액이 모자라면 있는 만큼만 깎는다 (음수 금지)', async () => {
    repo.findReviewRewardAmount.mockResolvedValue(300)
    repo.decrementPointToZero.mockResolvedValue({ revoked: 120, balanceAfter: 0 })

    const { revoked } = await revokeReviewReward(db, { userId: 'u1', reviewId: 'r1' })

    expect(revoked).toBe(120)
    const [, tx] = repo.createPointTransaction.mock.calls[0]
    expect(tx.amount).toBe(-120)
    expect(tx.balanceAfter).toBe(0)
  })

  it('지급 이력이 없으면 아무것도 하지 않는다', async () => {
    repo.findReviewRewardAmount.mockResolvedValue(0)

    const { revoked } = await revokeReviewReward(db, { userId: 'u1', reviewId: 'r1' })

    expect(revoked).toBe(0)
    expect(repo.decrementPointToZero).not.toHaveBeenCalled()
  })
})

describe('신청 사용', () => {
  it('잔액과 총액 중 작은 값만 쓴다 (총액을 넘겨 쓰지 않는다)', async () => {
    repo.findUserPointBalance.mockResolvedValue(50000)

    const { usedPoint } = await usePointForApplication(db, {
      userId: 'u1',
      applicationId: 'a1',
      totalAmount: 9800,
    })

    expect(usedPoint).toBe(9800)
    expect(repo.decrementPointIfEnough).toHaveBeenCalledWith(db, 'u1', 9800)
  })

  it('잔액이 총액보다 적으면 잔액만큼만 쓴다', async () => {
    repo.findUserPointBalance.mockResolvedValue(1200)

    const { usedPoint } = await usePointForApplication(db, {
      userId: 'u1',
      applicationId: 'a1',
      totalAmount: 9800,
    })

    expect(usedPoint).toBe(1200)
  })

  it('잔액이 0이면 차감하지 않는다', async () => {
    repo.findUserPointBalance.mockResolvedValue(0)

    const { usedPoint } = await usePointForApplication(db, {
      userId: 'u1',
      applicationId: 'a1',
      totalAmount: 9800,
    })

    expect(usedPoint).toBe(0)
    expect(repo.decrementPointIfEnough).not.toHaveBeenCalled()
  })

  it('조회와 차감 사이에 먼저 쓰였으면 409로 막는다 (조용히 0으로 넘기지 않는다)', async () => {
    repo.findUserPointBalance.mockResolvedValue(1200)
    repo.decrementPointIfEnough.mockResolvedValue(false)

    await expect(
      usePointForApplication(db, { userId: 'u1', applicationId: 'a1', totalAmount: 9800 }),
    ).rejects.toMatchObject({ statusCode: 409 })
  })
})

describe('반환', () => {
  it('이력에서 계산한 미반환액만 돌려준다', async () => {
    repo.findRefundableAmount.mockResolvedValue(1200)
    repo.incrementPoint.mockResolvedValue({ pointBalance: 1200 })

    const { refunded } = await refundApplicationPoint(db, {
      userId: 'u1',
      applicationId: 'a1',
      reason: '신청 거절로 반환',
    })

    expect(refunded).toBe(1200)
    expect(repo.incrementPoint).toHaveBeenCalledWith(db, 'u1', 1200)
  })

  it('이미 반환됐으면 두 번 돌려주지 않는다 (취소 두 번 시도 방어)', async () => {
    repo.findRefundableAmount.mockResolvedValue(0)

    const { refunded } = await refundApplicationPoint(db, {
      userId: 'u1',
      applicationId: 'a1',
      reason: '파티원 제거로 반환',
    })

    expect(refunded).toBe(0)
    expect(repo.incrementPoint).not.toHaveBeenCalled()
    expect(repo.createPointTransaction).not.toHaveBeenCalled()
  })
})
