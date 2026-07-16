import type { AuthProvider } from '@prisma/client'
import {
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

  const totalPaidAmount = user.partyApplications.reduce((sum, app) => {
    return app.status === 'confirmed' ? sum + app.totalAmount : sum
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
