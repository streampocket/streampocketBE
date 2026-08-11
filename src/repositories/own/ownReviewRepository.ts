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

// 포인트 적립과 한 트랜잭션으로 묶어야 해서 db를 받는다 —
// 리뷰만 저장되고 적립이 실패하면 사용자에겐 실패로 보이는데 재작성은 409가 된다.
export function createReview(data: CreateReviewInput, db: Prisma.TransactionClient | typeof prisma = prisma) {
  return db.ownReview.create({
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
      // 적립 예정액 계산용 — 기준이 실결제액(총액 − 사용 포인트)이다
      totalAmount: true,
      usedPoint: true,
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
