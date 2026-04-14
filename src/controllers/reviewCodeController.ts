import { Prisma, ReviewCodeStatus } from '@prisma/client'
import { Request, Response } from 'express'
import { z } from 'zod'
import {
  createReviewCodeBatch,
  createReviewCodeEntry,
  deleteReviewCodeEntry,
  getReviewCodes,
  updateReviewCodeEntry,
  updateReviewCodeEntryStatus,
} from '../services/reviewCodeService'

const reviewCodeIdParamSchema = z.object({
  id: z.string().uuid(),
})

const reviewCodeListQuerySchema = z.object({
  status: z.nativeEnum(ReviewCodeStatus).optional(),
  gameName: z.string().trim().optional(),
  sortField: z.enum(['createdAt', 'usedAt']).default('createdAt'),
  dateOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
})

const reviewCodeBodySchema = z.object({
  gameName: z.string().trim().optional(),
  code: z.string().trim().min(1),
})

const reviewCodeBatchBodySchema = z.object({
  gameName: z.string().trim().optional(),
  codes: z
    .array(z.string().trim().min(1))
    .min(1, '최소 1개의 코드를 입력해주세요.')
    .max(500, '한 번에 최대 500개까지 등록할 수 있습니다.'),
})

const reviewCodeStatusBodySchema = z.object({
  status: z.nativeEnum(ReviewCodeStatus),
  usedBy: z.string().trim().optional(),
})

export async function getReviewCodesHandler(req: Request, res: Response): Promise<void> {
  const query = reviewCodeListQuerySchema.parse(req.query)
  const result = await getReviewCodes({
    status: query.status,
    gameName: query.gameName,
    sortField: query.sortField,
    dateOrder: query.dateOrder as Prisma.SortOrder,
    page: query.page,
    pageSize: query.pageSize,
  })

  res.json({
    data: result.items,
    total: result.total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.ceil(result.total / query.pageSize),
  })
}

export async function createReviewCodeHandler(req: Request, res: Response): Promise<void> {
  const body = reviewCodeBodySchema.parse(req.body)
  const reviewCode = await createReviewCodeEntry(body)
  res.status(201).json({ data: reviewCode })
}

export async function createReviewCodeBatchHandler(req: Request, res: Response): Promise<void> {
  const body = reviewCodeBatchBodySchema.parse(req.body)
  const result = await createReviewCodeBatch(body)
  res.status(201).json({ data: result })
}

export async function updateReviewCodeHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = reviewCodeIdParamSchema.parse(req.params)
  const body = reviewCodeBodySchema.parse(req.body)
  const reviewCode = await updateReviewCodeEntry(id, body)
  res.json({ data: reviewCode })
}

export async function updateReviewCodeStatusHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = reviewCodeIdParamSchema.parse(req.params)
  const body = reviewCodeStatusBodySchema.parse(req.body)
  const reviewCode = await updateReviewCodeEntryStatus(id, body)
  res.json({ data: reviewCode })
}

export async function deleteReviewCodeHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = reviewCodeIdParamSchema.parse(req.params)
  await deleteReviewCodeEntry(id)
  res.json({ message: '리뷰 게임 코드가 삭제되었습니다.' })
}
