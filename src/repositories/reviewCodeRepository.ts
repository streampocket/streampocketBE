import { Prisma, ReviewCode, ReviewCodeStatus } from '@prisma/client'
import { prisma } from '../lib/prisma'

export type ReviewCodeListParams = {
  status?: ReviewCodeStatus
  gameName?: string
  dateOrder: Prisma.SortOrder
  page: number
  pageSize: number
}

export type CreateReviewCodeInput = {
  gameName?: string
  code: string
}

export type UpdateReviewCodeInput = {
  gameName?: string
  code: string
}

export type UpdateReviewCodeStatusInput = {
  status: ReviewCodeStatus
  usedBy: string | null
  usedAt: Date | null
}

function buildWhereClause(params: Pick<ReviewCodeListParams, 'status' | 'gameName'>): Prisma.ReviewCodeWhereInput {
  return {
    ...(params.status ? { status: params.status } : {}),
    ...(params.gameName
      ? {
          gameName: {
            contains: params.gameName,
            mode: 'insensitive',
          },
        }
      : {}),
  }
}

export async function findReviewCodes(
  params: ReviewCodeListParams,
): Promise<{ items: ReviewCode[]; total: number }> {
  const where = buildWhereClause(params)

  const [items, total] = await prisma.$transaction([
    prisma.reviewCode.findMany({
      where,
      orderBy: { createdAt: params.dateOrder },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.reviewCode.count({ where }),
  ])

  return { items, total }
}

export async function findReviewCodeById(id: string): Promise<ReviewCode | null> {
  return prisma.reviewCode.findUnique({ where: { id } })
}

export async function createReviewCode(data: CreateReviewCodeInput): Promise<ReviewCode> {
  return prisma.reviewCode.create({ data })
}

export async function updateReviewCode(
  id: string,
  data: UpdateReviewCodeInput,
): Promise<ReviewCode> {
  return prisma.reviewCode.update({
    where: { id },
    data,
  })
}

export async function updateReviewCodeStatus(
  id: string,
  data: UpdateReviewCodeStatusInput,
): Promise<ReviewCode> {
  return prisma.reviewCode.update({
    where: { id },
    data,
  })
}

export async function deleteReviewCode(id: string): Promise<void> {
  await prisma.reviewCode.delete({ where: { id } })
}
