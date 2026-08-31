import type { AuthProvider } from '@prisma/client'
import {
  countUsersCreatedBetween,
  findUsers,
  findUserDetailById,
  type UserStatusFilter,
} from '../../repositories/own/adminUserRepository'
import { WITHDRAWAL_RETENTION_DAYS } from './userWithdrawalService'
import { RETURN_REAPPLY_BLOCK_HOURS } from '../../constants/party'
import { releaseActiveReturnCooldowns } from '../../repositories/own/partyApplicationRepository'
import { findUserById } from '../../repositories/own/userRepository'
import { sendDiscordAlert } from '../../lib/discord'
import { formatKstDateTime } from '../../utils/kst'

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

/**
 * 유저의 유효한 반품 재신청 차단(12시간 이내 returnedAt)을 일괄 해제한다.
 * 해제 즉시 재신청 가능. 12시간 경과분은 가드에 안 걸리는 이력이므로 건드리지 않는다.
 */
export async function releaseUserReturnCooldowns(userId: string) {
  const user = await findUserById(userId)
  if (!user) {
    throw Object.assign(new Error('회원을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  const since = new Date(Date.now() - RETURN_REAPPLY_BLOCK_HOURS * 60 * 60 * 1000)
  const { count } = await releaseActiveReturnCooldowns(userId, since)
  if (count === 0) {
    // 버튼은 차단이 있을 때만 노출되므로 0건 = 낡은 화면(타 관리자 해제/12시간 자연 경과)
    throw Object.assign(new Error('해제할 재신청 차단이 없습니다.'), { statusCode: 409 })
  }

  const message = [
    '[재신청 차단 해제 — 관리자]',
    `회원: ${user.name} (${user.email})`,
    `해제 건수: ${count}건`,
    `해제일시: ${formatKstDateTime()} (KST)`,
  ].join('\n')
  sendDiscordAlert('partyApply', message, { color: 0x95a5a6 }).catch(() => {})

  return { data: { releasedCount: count } }
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

  // 현재 유효한 재신청 차단 — 차단 판정(findRecentReturnInCategory)과 같은 기준:
  // 12시간 이내 returnedAt, 카테고리 단위, 같은 카테고리에 여러 건이면 최신 1건
  const cooldownSince = now.getTime() - RETURN_REAPPLY_BLOCK_HOURS * 60 * 60 * 1000
  const cooldownByCategory = new Map<
    string,
    { categoryId: string; categoryName: string; partyName: string; returnedAt: Date; retryAt: Date }
  >()
  for (const app of user.partyApplications) {
    if (!app.returnedAt || app.returnedAt.getTime() <= cooldownSince) continue
    const existing = cooldownByCategory.get(app.product.category.id)
    if (existing && existing.returnedAt.getTime() >= app.returnedAt.getTime()) continue
    cooldownByCategory.set(app.product.category.id, {
      categoryId: app.product.category.id,
      categoryName: app.product.category.name,
      partyName: app.product.name,
      returnedAt: app.returnedAt,
      retryAt: new Date(app.returnedAt.getTime() + RETURN_REAPPLY_BLOCK_HOURS * 60 * 60 * 1000),
    })
  }
  const returnCooldowns = [...cooldownByCategory.values()].sort(
    (a, b) => b.retryAt.getTime() - a.retryAt.getTime(),
  )

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
    returnCooldowns,
    termsAgreements: user.termsAgreements,
    stats: {
      totalPaidAmount,
      partyCount: user.partyApplications.filter((app) => app.status === 'confirmed').length,
      activePartyCount,
    },
  }
}
