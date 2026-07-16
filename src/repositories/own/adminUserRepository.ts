import { prisma } from '../../lib/prisma'
import type { AuthProvider } from '@prisma/client'

export type UserStatusFilter = 'active' | 'withdrawn'

type ListUsersInput = {
  search?: string
  provider?: AuthProvider
  status: UserStatusFilter
  page: number
  pageSize: number
}

export async function findUsers(input: ListUsersInput) {
  const searchFields =
    input.status === 'withdrawn'
      ? // 탈퇴 회원은 email/phone이 익명화돼 있어 원본 컬럼으로 검색
        [
          { originalEmail: { contains: input.search, mode: 'insensitive' as const } },
          { name: { contains: input.search, mode: 'insensitive' as const } },
          { originalPhone: { contains: input.search } },
        ]
      : [
          { email: { contains: input.search, mode: 'insensitive' as const } },
          { name: { contains: input.search, mode: 'insensitive' as const } },
          { phone: { contains: input.search } },
        ]

  const where = {
    deletedAt: input.status === 'withdrawn' ? { not: null } : null,
    ...(input.provider ? { provider: input.provider } : {}),
    ...(input.search ? { OR: searchFields } : {}),
  }

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        phoneVerified: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        withdrawalReason: true,
        withdrawnByAdmin: true,
        originalEmail: true,
        originalPhone: true,
        _count: {
          select: {
            partyApplications: { where: { status: 'confirmed' } },
          },
        },
      },
      orderBy: input.status === 'withdrawn' ? { deletedAt: 'desc' } : { createdAt: 'desc' },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.user.count({ where }),
  ])

  return { items, total }
}

export function findUserDetailById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      phoneVerified: true,
      provider: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      withdrawalReason: true,
      withdrawnByAdmin: true,
      originalEmail: true,
      originalPhone: true,
      termsAgreements: {
        select: { type: true, agreedAt: true },
        orderBy: { agreedAt: 'desc' },
      },
      partyApplications: {
        select: {
          id: true,
          status: true,
          price: true,
          fee: true,
          totalAmount: true,
          startedAt: true,
          expiresAt: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              status: true,
              durationDays: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}
