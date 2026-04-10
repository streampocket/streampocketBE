import type { AuthProvider } from '@prisma/client'
import { findUsers, findUserDetailById } from '../../repositories/own/adminUserRepository'

type ListUsersInput = {
  search?: string
  provider?: AuthProvider
  page: number
  pageSize: number
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
    hasPartner: !!user.partner,
    _count: user._count,
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
    const paidSum = app.payments
      .filter((p) => p.status === 'paid')
      .reduce((s, p) => s + p.amount, 0)
    return sum + paidSum
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
    },
    partner: user.partner,
    ownProducts: user.ownProducts,
    partyApplications: user.partyApplications,
    termsAgreements: user.termsAgreements,
    stats: {
      totalPaidAmount,
      partyCount: user.partyApplications.length,
      activePartyCount,
      ownProductCount: user.ownProducts.length,
    },
  }
}
