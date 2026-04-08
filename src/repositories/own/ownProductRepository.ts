import { prisma } from '../../lib/prisma'

type CreateOwnProductInput = {
  name: string
  categoryId: string
  durationDays: number
  price: number
  totalSlots: number
  imagePath?: string | null
  notes?: string | null
  accountId?: string | null
  accountPassword?: string | null
  userId: string
}

type UpdateOwnProductInput = {
  name?: string
  categoryId?: string
  durationDays?: number
  price?: number
  totalSlots?: number
  imagePath?: string | null
  notes?: string | null
  accountId?: string | null
  accountPassword?: string | null
  status?: 'recruiting' | 'closed' | 'expired'
}

type OwnProductFilters = {
  categoryId?: string
  status?: 'recruiting' | 'closed' | 'expired'
  search?: string
  page?: number
  pageSize?: number
}

const productInclude = {
  category: true,
  user: { select: { id: true, name: true } },
} as const

export function createOwnProduct(data: CreateOwnProductInput) {
  return prisma.ownProduct.create({
    data,
    include: productInclude,
  })
}

export async function findAllOwnProducts(filters: OwnProductFilters) {
  const where = {
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' as const } },
            { user: { name: { contains: filters.search, mode: 'insensitive' as const } } },
          ],
        }
      : {}),
  }

  if (filters.page && filters.pageSize) {
    const [items, total] = await prisma.$transaction([
      prisma.ownProduct.findMany({
        where,
        include: productInclude,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.ownProduct.count({ where }),
    ])
    return { items, total }
  }

  const items = await prisma.ownProduct.findMany({
    where,
    include: productInclude,
    orderBy: { createdAt: 'desc' },
  })
  return { items, total: items.length }
}

export function findOwnProductsByUserId(userId: string) {
  return prisma.ownProduct.findMany({
    where: { userId },
    include: productInclude,
    orderBy: { createdAt: 'desc' },
  })
}

export function findOwnProductById(id: string) {
  return prisma.ownProduct.findUnique({
    where: { id },
    include: productInclude,
  })
}

export function updateOwnProduct(id: string, data: UpdateOwnProductInput) {
  return prisma.ownProduct.update({
    where: { id },
    data,
    include: productInclude,
  })
}

export function deleteOwnProductById(id: string) {
  return prisma.ownProduct.delete({ where: { id } })
}

export function findOwnProductCredentialsById(id: string) {
  return prisma.ownProduct.findUnique({
    where: { id },
    select: { accountId: true, accountPassword: true, userId: true },
  })
}

export function findFullyExpiredProducts() {
  return prisma.ownProduct.findMany({
    where: {
      status: 'closed',
      applications: {
        every: {
          OR: [
            { status: 'expired' },
            { status: 'cancelled' },
          ],
        },
        some: {
          status: 'expired',
        },
      },
    },
    select: { id: true, name: true },
  })
}

export function bulkExpireProducts(ids: string[]) {
  return prisma.ownProduct.updateMany({
    where: { id: { in: ids } },
    data: { status: 'expired' },
  })
}

export function findOwnProductWithApplications(id: string) {
  return prisma.ownProduct.findUnique({
    where: { id },
    include: {
      ...productInclude,
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          partner: {
            select: {
              phone: true,
              bankName: true,
              bankAccount: true,
            },
          },
        },
      },
      applications: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          payments: {
            orderBy: { createdAt: 'desc' as const },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' as const },
      },
    },
  })
}
