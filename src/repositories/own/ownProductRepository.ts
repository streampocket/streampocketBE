import { prisma } from '../../lib/prisma'
import type { Prisma } from '@prisma/client'

type CreateOwnProductInput = {
  name: string
  categoryId: string
  durationDays: number
  price: number
  dailyDiscount?: number
  totalSlots: number
  partyType?: 'personal' | 'shared'
  durationMode?: 'countdown' | 'fixed'
  imagePath?: string | null
  notes?: string | null
  leaderName: string
}

type UpdateOwnProductInput = {
  name?: string
  categoryId?: string
  durationDays?: number
  price?: number
  dailyDiscount?: number
  totalSlots?: number
  partyType?: 'personal' | 'shared'
  durationMode?: 'countdown' | 'fixed'
  imagePath?: string | null
  notes?: string | null
  leaderName?: string
  status?: 'recruiting' | 'closed' | 'expired'
}

type OwnProductFilters = {
  categoryId?: string
  status?: 'recruiting' | 'closed' | 'expired'
  search?: string
  page?: number
  pageSize?: number
  limit?: number
}

const productInclude = {
  category: true,
} as const

export function createOwnProduct(data: CreateOwnProductInput) {
  return prisma.ownProduct.create({
    data,
    include: productInclude,
  })
}

export async function findAllOwnProducts(filters: OwnProductFilters) {
  const where: Prisma.OwnProductWhereInput = {
    deletedAt: null,
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' as const } },
            { leaderName: { contains: filters.search, mode: 'insensitive' as const } },
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

/**
 * sitemap용 최소 조회 — id·상태·수정시각만.
 *
 * `findAllOwnProducts`를 쓰지 않는 이유: 그쪽은 전체 필드 + category를 include해
 * 1,500여 건이면 응답이 3MB에 달한다. sitemap은 URL과 lastModified만 필요하다.
 * status는 모집중/마감을 나눠 changeFrequency·priority를 달리 주는 데 쓴다.
 */
export function findOwnProductIdsForSitemap() {
  return prisma.ownProduct.findMany({
    where: { deletedAt: null },
    select: { id: true, status: true, updatedAt: true },
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

export function softDeleteOwnProductById(id: string) {
  return prisma.ownProduct.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}

export function findRecruitingStartedProducts() {
  return prisma.ownProduct.findMany({
    where: {
      status: 'recruiting',
      startedAt: { not: null },
      deletedAt: null,
    },
    select: { id: true, name: true, startedAt: true, durationDays: true, partyType: true },
  })
}

export function bulkCloseProducts(ids: string[]) {
  return prisma.ownProduct.updateMany({
    where: { id: { in: ids } },
    data: { status: 'closed' },
  })
}

export function findFullyExpiredProducts() {
  return prisma.ownProduct.findMany({
    where: {
      status: 'closed',
      deletedAt: null,
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
      applications: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' as const },
      },
    },
  })
}
