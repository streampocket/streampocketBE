import type { AuthProvider } from '@prisma/client'
import {
  countUsersCreatedBetween,
  findUsers,
  findUserDetailById,
  type UserStatusFilter,
} from '../../repositories/own/adminUserRepository'
import { WITHDRAWAL_RETENTION_DAYS } from './userWithdrawalService'

type ListUsersInput = {
  search?: string
  provider?: AuthProvider
  status: UserStatusFilter
  page: number
  pageSize: number
}

// 탈퇴일 + 보관 기간(30일) = 완전 삭제 예정일
function purgeScheduledAt(deletedAt: Date | null): Date | null {
  if (!deletedAt) return null
  return new Date(deletedAt.getTime() + WITHDRAWAL_RETENTION_DAYS * 24 * 60 * 60 * 1000)
}

export type SignupStats = {
  range: { from: string; to: string }
  /** KST 오늘 00:00 ~ 23:59:59.999 가입 수 */
  today: number
  /** 조회 기간(from~to) 가입 수 */
  rangeTotal: number
}

/** KST 오늘 'YYYY-MM-DD' — +9h 시프트 후 getUTC*로 산출 (서버 타임존 무관) */
function kstTodayString(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

/**
 * 가입자 수 — 방문자 통계 화면용.
 * 경계는 +09:00을 명시한다. 빼면 UTC로 해석돼 9시간 어긋난 구간을 세게 된다.
 */
export async function getSignupStats(input: { from: string; to: string }): Promise<SignupStats> {
  const today = kstTodayString()

  const [todayCount, rangeTotal] = await Promise.all([
    countUsersCreatedBetween(
      new Date(`${today}T00:00:00.000+09:00`),
      new Date(`${today}T23:59:59.999+09:00`),
    ),
    countUsersCreatedBetween(
      new Date(`${input.from}T00:00:00.000+09:00`),
      new Date(`${input.to}T23:59:59.999+09:00`),
    ),
  ])

  return { range: { from: input.from, to: input.to }, today: todayCount, rangeTotal }
}

export async function getUsers(input: ListUsersInput) {
  const { items, total } = await findUsers(input)

  const data = items.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    provider: user.provider,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    _count: user._count,
    // 탈퇴 정보 (active 목록에서는 전부 null/false)
    deletedAt: user.deletedAt,
    withdrawalReason: user.withdrawalReason,
    withdrawnByAdmin: user.withdrawnByAdmin,
    originalEmail: user.originalEmail,
    originalPhone: user.originalPhone,
    purgeScheduledAt: purgeScheduledAt(user.deletedAt),
  }))

  return {
    data,
    total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: Math.ceil(total / input.pageSize),
  }
}

export async function getUserDetail(id: string) {
  const user = await findUserDetailById(id)
  if (!user) {
    throw Object.assign(new Error('회원을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  // 실제로 받은 돈 기준 — 포인트로 깎인 만큼은 입금되지 않았으므로 빼고 센다
  const totalPaidAmount = user.partyApplications.reduce((sum, app) => {
    return app.status === 'confirmed' ? sum + (app.totalAmount - app.usedPoint) : sum
  }, 0)

  const now = new Date()
  const activePartyCount = user.partyApplications.filter(
    (app) => app.status === 'confirmed' && app.expiresAt && new Date(app.expiresAt) > now,
  ).length

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      provider: user.provider,
      pointBalance: user.pointBalance,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
      withdrawalReason: user.withdrawalReason,
      withdrawnByAdmin: user.withdrawnByAdmin,
      originalEmail: user.originalEmail,
      originalPhone: user.originalPhone,
      purgeScheduledAt: purgeScheduledAt(user.deletedAt),
    },
    partyApplications: user.partyApplications,
    termsAgreements: user.termsAgreements,
    stats: {
      totalPaidAmount,
      partyCount: user.partyApplications.filter((app) => app.status === 'confirmed').length,
      activePartyCount,
    },
  }
}
