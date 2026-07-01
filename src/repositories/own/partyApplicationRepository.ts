import { prisma } from '../../lib/prisma'
import type { PartyApplicationStatus, Prisma } from '@prisma/client'

type CreateApplicationInput = {
  productId: string
  userId: string
  price: number
  fee: number
  totalAmount: number
}

export function findActiveApplication(productId: string, userId: string) {
  return prisma.partyApplication.findFirst({
    where: {
      productId,
      userId,
      status: { in: ['pending', 'confirmed'] },
    },
  })
}

export function createApplication(data: CreateApplicationInput) {
  return prisma.partyApplication.create({
    data,
    include: {
      product: {
        include: {
          category: true,
          user: { select: { id: true, name: true } },
        },
      },
    },
  })
}

export function findApplicationsByUserId(userId: string) {
  return prisma.partyApplication.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          durationDays: true,
          price: true,
          totalSlots: true,
          filledSlots: true,
          imagePath: true,
          status: true,
          partyType: true,
          category: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export function findExpiredApplications() {
  return prisma.partyApplication.findMany({
    where: {
      status: 'confirmed',
      expiresAt: { lte: new Date() },
    },
    include: {
      product: { select: { id: true, name: true, partyType: true } },
      user: { select: { id: true, name: true } },
    },
  })
}

export function bulkExpireApplications(ids: string[]) {
  return prisma.partyApplication.updateMany({
    where: { id: { in: ids } },
    data: { status: 'expired' },
  })
}

export function findApplicationWithProduct(applicationId: string) {
  return prisma.partyApplication.findUnique({
    where: { id: applicationId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          status: true,
          accountId: true,
          accountPassword: true,
        },
      },
    },
  })
}

// ─────────────── 관리자용 ───────────────

type AdminListInput = {
  status?: PartyApplicationStatus
  search?: string
  page: number
  pageSize: number
}

export async function findApplicationsForAdmin(input: AdminListInput) {
  const where: Prisma.PartyApplicationWhereInput = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.search
      ? {
          OR: [
            { user: { name: { contains: input.search, mode: 'insensitive' } } },
            { user: { phone: { contains: input.search } } },
            { product: { name: { contains: input.search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.partyApplication.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        product: {
          select: {
            id: true,
            name: true,
            durationDays: true,
            partyType: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.partyApplication.count({ where }),
  ])

  return { items, total }
}

export function findApplicationDetailForAdmin(applicationId: string) {
  return prisma.partyApplication.findUnique({
    where: { id: applicationId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      product: {
        select: {
          id: true,
          name: true,
          durationDays: true,
          totalSlots: true,
          filledSlots: true,
          partyType: true,
          category: { select: { id: true, name: true } },
        },
      },
    },
  })
}
