import { prisma } from '../../lib/prisma'

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
    include: {
      payments: {
        orderBy: { createdAt: 'desc' as const },
        take: 1,
      },
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
          category: { select: { id: true, name: true } },
        },
      },
      payments: {
        orderBy: { createdAt: 'desc' as const },
        take: 1,
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
      product: { select: { id: true, name: true } },
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
