import { prisma } from '../../lib/prisma'
import type { Prisma } from '@prisma/client'

type GcoinProductStatus = 'on_sale' | 'hidden' | 'sold_out'
type GcoinProductCategory = 'gcoin' | 'item'

type CreateGcoinProductInput = {
  name: string
  category: GcoinProductCategory
  gcoinAmount?: number | null
  salePrice: number
  listPrice?: number | null
  listPriceUsd?: number | null
  description?: string | null
  imageUrl?: string | null
  sortOrder: number
  status?: GcoinProductStatus
}

type UpdateGcoinProductInput = {
  name?: string
  category?: GcoinProductCategory
  gcoinAmount?: number | null
  salePrice?: number
  listPrice?: number | null
  listPriceUsd?: number | null
  description?: string | null
  imageUrl?: string | null
  sortOrder?: number
  status?: GcoinProductStatus
}

type GcoinProductFilters = {
  status?: GcoinProductStatus
  category?: GcoinProductCategory
  search?: string
  page?: number
  pageSize?: number
}

const listOrderBy = [
  { sortOrder: 'asc' as const },
  { createdAt: 'desc' as const },
]

export function createGcoinProduct(data: CreateGcoinProductInput) {
  return prisma.gcoinProduct.create({ data })
}

export async function findAllGcoinProducts(filters: GcoinProductFilters) {
  const where: Prisma.GcoinProductWhereInput = {
    deletedAt: null,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.search
      ? { name: { contains: filters.search, mode: 'insensitive' as const } }
      : {}),
  }

  if (filters.page && filters.pageSize) {
    const [items, total] = await prisma.$transaction([
      prisma.gcoinProduct.findMany({
        where,
        orderBy: listOrderBy,
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.gcoinProduct.count({ where }),
    ])
    return { items, total }
  }

  const items = await prisma.gcoinProduct.findMany({ where, orderBy: listOrderBy })
  return { items, total: items.length }
}

/** 공개 조회 — 숨김 제외 (판매중 + 품절) */
export function findVisibleGcoinProducts() {
  return prisma.gcoinProduct.findMany({
    where: { deletedAt: null, status: { in: ['on_sale', 'sold_out'] } },
    orderBy: listOrderBy,
  })
}

export function findGcoinProductById(id: string) {
  return prisma.gcoinProduct.findUnique({ where: { id } })
}

export function updateGcoinProduct(id: string, data: UpdateGcoinProductInput) {
  return prisma.gcoinProduct.update({ where: { id }, data })
}

export function softDeleteGcoinProductById(id: string) {
  return prisma.gcoinProduct.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}

/** 진열 순서 자동 부여용 — 삭제 안 된 상품의 최대 sortOrder */
export async function findMaxGcoinSortOrder(): Promise<number> {
  const result = await prisma.gcoinProduct.aggregate({
    where: { deletedAt: null },
    _max: { sortOrder: true },
  })
  return result._max.sortOrder ?? 0
}
