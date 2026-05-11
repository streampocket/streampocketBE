import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'

export type ReviewListSort = 'latest' | 'rating'

type ReviewListInput = {
  productId?: string
  categoryId?: string
  sort: ReviewListSort
  page: number
  pageSize: number
}

const PUBLIC_INCLUDE = {
  product: {
    select: {
      id: true,
      name: true,
      category: { select: { id: true, name: true } },
    },
  },
  user: { select: { id: true, name: true } },
} as const

export async function findReviewsForPublic(input: ReviewListInput) {
  const where: Prisma.OwnReviewWhereInput = {
    ...(input.productId ? { productId: input.productId } : {}),
    ...(input.categoryId ? { product: { categoryId: input.categoryId } } : {}),
  }

  const orderBy: Prisma.OwnReviewOrderByWithRelationInput[] =
    input.sort === 'rating'
      ? [{ rating: 'desc' }, { createdAt: 'desc' }]
      : [{ createdAt: 'desc' }]

  const [items, total] = await Promise.all([
    prisma.ownReview.findMany({
      where,
      include: PUBLIC_INCLUDE,
      orderBy,
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.ownReview.count({ where }),
  ])

  return { items, total }
}

export function findReviewByIdForPublic(id: string) {
  return prisma.ownReview.findUnique({
    where: { id },
    include: PUBLIC_INCLUDE,
  })
}

export function findReviewById(id: string) {
  return prisma.ownReview.findUnique({ where: { id } })
}

type CreateReviewInput = {
  applicationId: string
  productId: string
  userId: string
  content: string
  rating: number
  imageUrl: string | null
}

export function createReview(data: CreateReviewInput) {
  return prisma.ownReview.create({
    data,
    include: PUBLIC_INCLUDE,
  })
}

type UpdateReviewInput = {
  content: string
  rating: number
  imageUrl: string | null
}

export function updateReview(id: string, data: UpdateReviewInput) {
  return prisma.ownReview.update({
    where: { id },
    data,
    include: PUBLIC_INCLUDE,
  })
}

export function deleteReviewById(id: string) {
  return prisma.ownReview.delete({ where: { id } })
}

export function findReviewableApplications(userId: string) {
  return prisma.partyApplication.findMany({
    where: {
      userId,
      status: 'confirmed',
      review: null,
    },
    select: {
      id: true,
      startedAt: true,
      expiresAt: true,
      product: {
        select: {
          id: true,
          name: true,
          category: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { startedAt: 'desc' },
  })
}

// ─────────────── 관리자용 ───────────────

type AdminListInput = {
  search?: string
  categoryId?: string
  rating?: number
  page: number
  pageSize: number
}

export async function findReviewsForAdmin(input: AdminListInput) {
  const where: Prisma.OwnReviewWhereInput = {
    ...(input.categoryId ? { product: { categoryId: input.categoryId } } : {}),
    ...(typeof input.rating === 'number' ? { rating: input.rating } : {}),
    ...(input.search
      ? {
          OR: [
            { content: { contains: input.search, mode: 'insensitive' } },
            { user: { name: { contains: input.search, mode: 'insensitive' } } },
            { product: { name: { contains: input.search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.ownReview.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: { select: { id: true, name: true } },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.ownReview.count({ where }),
  ])

  return { items, total }
}
