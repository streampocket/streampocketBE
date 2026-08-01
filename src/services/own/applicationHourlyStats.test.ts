import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// 저장소는 모킹한다 — 여기서 고정하려는 건 DB 집계가 아니라
// "KST 경계를 어디로 잡고, 빈 시간대를 어떻게 채우는가"라는 규칙이다.
const repo = vi.hoisted(() => ({
  groupApplicationsByHour: vi.fn(),
  countUsersCreatedBetween: vi.fn(),
}))

vi.mock('../../repositories/own/partyApplicationRepository', () => ({
  groupApplicationsByHour: repo.groupApplicationsByHour,
  findActiveApplication: vi.fn(),
  findApplicationsByUserId: vi.fn(),
  findApplicationsForAdmin: vi.fn(),
  findApplicationDetailForAdmin: vi.fn(),
  createApplication: vi.fn(),
  findWithdrawalBlockingApplication: vi.fn(),
  findExpiredApplications: vi.fn(),
  bulkExpireApplications: vi.fn(),
}))

vi.mock('../../repositories/own/adminUserRepository', () => ({
  countUsersCreatedBetween: repo.countUsersCreatedBetween,
  findUsers: vi.fn(),
  findUserDetailById: vi.fn(),
}))

const { getApplicationHourlyStats } = await import('./partyApplicationService')
const { getSignupStats } = await import('./adminUserService')

beforeEach(() => {
  vi.clearAllMocks()
  repo.groupApplicationsByHour.mockResolvedValue([])
  repo.countUsersCreatedBetween.mockResolvedValue(0)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('신청 시간대 집계 — 조회 구간', () => {
  it('KST 하루 전체를 덮는다 (00:00:00 ~ 23:59:59.999 +09:00)', async () => {
    await getApplicationHourlyStats({ from: '2026-08-01', to: '2026-08-01' })

    const [from, to] = repo.groupApplicationsByHour.mock.calls[0]
    // KST 08-01 00:00 = UTC 07-31 15:00
    expect(from.toISOString()).toBe('2026-07-31T15:00:00.000Z')
    // KST 08-01 23:59:59.999 = UTC 08-01 14:59:59.999
    expect(to.toISOString()).toBe('2026-08-01T14:59:59.999Z')
  })

  it('오프셋을 빼먹으면 안 된다 — UTC로 해석하면 9시간 어긋난다', async () => {
    await getApplicationHourlyStats({ from: '2026-08-01', to: '2026-08-01' })

    const [from] = repo.groupApplicationsByHour.mock.calls[0]
    expect(from.toISOString()).not.toBe('2026-08-01T00:00:00.000Z')
  })
})

describe('신청 시간대 집계 — 0~23 채움', () => {
  it('신청이 없는 시간대도 0으로 채워 24칸을 만든다', async () => {
    repo.groupApplicationsByHour.mockResolvedValue([{ hour: 21, count: 48 }])

    const result = await getApplicationHourlyStats({ from: '2026-08-01', to: '2026-08-01' })

    expect(result.hourly).toHaveLength(24)
    expect(result.hourly.map((h) => h.hour)).toEqual(Array.from({ length: 24 }, (_, i) => i))
    expect(result.hourly[21]).toEqual({ hour: 21, count: 48 })
    expect(result.hourly[0]).toEqual({ hour: 0, count: 0 })
  })

  it('총합과 피크 시간을 함께 돌려준다', async () => {
    repo.groupApplicationsByHour.mockResolvedValue([
      { hour: 3, count: 5 },
      { hour: 21, count: 48 },
      { hour: 22, count: 12 },
    ])

    const result = await getApplicationHourlyStats({ from: '2026-08-01', to: '2026-08-07' })

    expect(result.total).toBe(65)
    expect(result.peakHour).toBe(21)
  })

  it('신청이 하나도 없으면 피크는 null이다 (0시가 피크로 잡히지 않는다)', async () => {
    const result = await getApplicationHourlyStats({ from: '2026-08-01', to: '2026-08-01' })

    expect(result.total).toBe(0)
    expect(result.peakHour).toBeNull()
    expect(result.hourly).toHaveLength(24)
  })

  it('같은 건수가 여러 시간대면 이른 시간을 피크로 본다', async () => {
    repo.groupApplicationsByHour.mockResolvedValue([
      { hour: 9, count: 10 },
      { hour: 20, count: 10 },
    ])

    const result = await getApplicationHourlyStats({ from: '2026-08-01', to: '2026-08-01' })

    expect(result.peakHour).toBe(9)
  })
})

describe('가입자 수 — KST 오늘 판정', () => {
  it('KST 자정 직후에도 날짜가 하루 밀리지 않는다', async () => {
    vi.useFakeTimers()
    // UTC 08-01 15:30 = KST 08-02 00:30
    vi.setSystemTime(new Date('2026-08-01T15:30:00.000Z'))

    await getSignupStats({ from: '2026-07-01', to: '2026-08-02' })

    const [todayFrom, todayTo] = repo.countUsersCreatedBetween.mock.calls[0]
    expect(todayFrom.toISOString()).toBe('2026-08-01T15:00:00.000Z') // KST 08-02 00:00
    expect(todayTo.toISOString()).toBe('2026-08-02T14:59:59.999Z') // KST 08-02 23:59:59.999
  })

  it('KST 자정 직전은 아직 전날이다', async () => {
    vi.useFakeTimers()
    // UTC 08-01 14:30 = KST 08-01 23:30
    vi.setSystemTime(new Date('2026-08-01T14:30:00.000Z'))

    await getSignupStats({ from: '2026-07-01', to: '2026-08-01' })

    const [todayFrom] = repo.countUsersCreatedBetween.mock.calls[0]
    expect(todayFrom.toISOString()).toBe('2026-07-31T15:00:00.000Z') // KST 08-01 00:00
  })

  it('오늘과 조회 기간을 각각 센다', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-01T10:00:00.000Z'))
    repo.countUsersCreatedBetween.mockResolvedValueOnce(31).mockResolvedValueOnce(142)

    const result = await getSignupStats({ from: '2026-07-03', to: '2026-08-01' })

    expect(result.today).toBe(31)
    expect(result.rangeTotal).toBe(142)
    expect(result.range).toEqual({ from: '2026-07-03', to: '2026-08-01' })
    expect(repo.countUsersCreatedBetween).toHaveBeenCalledTimes(2)
  })
})
