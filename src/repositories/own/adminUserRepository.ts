import { prisma } from '../../lib/prisma'
import type { AuthProvider } from '@prisma/client'

type ListUsersInput = {
  search?: string
  provider?: AuthProvider
  page: number
  pageSize: number
}

export async function findUsers(input: ListUsersInput) {
  const where = {
    ...(input.provider ? { provider: input.provider } : {}),
    ...(input.search
      ? {
          OR: [
            { email: { contains: input.search, mode: 'insensitive' as const } },
            { name: { contains: input.search, mode: 'insensitive' as const } },
            { phone: { contains: input.search } },
          ],
        }
      : {}),
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
        partner: { select: { id: true } },
        _count: {
          select: {
            ownProducts: { where: { deletedAt: null } },
            partyApplications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
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
      partner: {
        select: {
          id: true,
          name: true,
          phone: true,
          bankName: true,
          bankAccount: true,
          status: true,
          createdAt: true,
        },
      },
      termsAgreements: {
        select: { type: true, agreedAt: true },
        orderBy: { agreedAt: 'desc' },
      },
      ownProducts: {
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          status: true,
          price: true,
          totalSlots: true,
          filledSlots: true,
          durationDays: true,
          createdAt: true,
          category: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
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
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
              paidAt: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}
