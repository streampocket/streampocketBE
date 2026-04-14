import { Prisma, ReviewCode, ReviewCodeStatus } from '@prisma/client'
import { prisma } from '../lib/prisma'

export type ReviewCodeListParams = {
  status?: ReviewCodeStatus
  gameName?: string
  sortField: 'createdAt' | 'usedAt'
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
      orderBy:
        params.sortField === 'usedAt'
          ? { usedAt: { sort: params.dateOrder, nulls: 'last' } }
          : { createdAt: params.dateOrder },
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

export async function createReviewCodes(
  dataList: CreateReviewCodeInput[],
): Promise<number> {
  const result = await prisma.reviewCode.createMany({ data: dataList })
  return result.count
}

export async function deleteReviewCode(id: string): Promise<void> {
  await prisma.reviewCode.delete({ where: { id } })
}

export async function reserveReviewCodes(
  count: number,
  usedBy: string,
): Promise<ReviewCode[]> {
  return prisma.$transaction(async (tx) => {
    const codes = await tx.reviewCode.findMany({
      where: { status: 'unused' },
      orderBy: { createdAt: 'asc' },
      take: count,
    })

    if (codes.length < count) {
      throw Object.assign(
        new Error(`사용 가능한 리뷰 코드가 부족합니다. (필요: ${count}, 가용: ${codes.length})`),
        { statusCode: 409 },
      )
    }

    const now = new Date()
    await tx.reviewCode.updateMany({
      where: { id: { in: codes.map((c) => c.id) } },
      data: { status: 'used', usedBy, usedAt: now },
    })

    return codes.map((c) => ({ ...c, status: 'used' as const, usedBy, usedAt: now }))
  })
}
