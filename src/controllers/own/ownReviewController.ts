import type { Request, Response } from 'express'
import { z } from 'zod'
import {
  adminDeleteReview,
  adminListReviews,
  createReviewForUser,
  getReview,
  getReviewableApplications,
  issueReviewImageUploadUrl,
  listReviews,
  updateReviewForUser,
} from '../../services/own/ownReviewService'

const idParamSchema = z.object({ id: z.string().uuid() })

const listQuerySchema = z.object({
  productId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  sort: z.enum(['latest', 'rating']).default('latest'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
})

const createBodySchema = z.object({
  applicationId: z.string().uuid(),
  content: z.string().trim().min(1).max(2000),
  rating: z.number().int().min(1).max(5),
  imageUrl: z.string().url().max(500).nullable().optional(),
})

const updateBodySchema = z.object({
  content: z.string().trim().min(1).max(2000),
  rating: z.number().int().min(1).max(5),
  imageUrl: z.string().url().max(500).nullable().optional(),
})

const presignBodySchema = z.object({
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  contentLength: z.number().int().min(1).max(5 * 1024 * 1024),
})

const adminListQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  categoryId: z.string().uuid().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

// ─────────────── 공개 ───────────────

export async function listReviewsHandler(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query)
  const result = await listReviews(query)
  res.json(result)
}

export async function getReviewHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const result = await getReview(id)
  res.json(result)
}

// ─────────────── 일반 회원 ───────────────

export async function getReviewableApplicationsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const result = await getReviewableApplications(userId)
  res.json(result)
}

export async function issueReviewImageUploadUrlHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const body = presignBodySchema.parse(req.body)
  const result = await issueReviewImageUploadUrl({ userId, ...body })
  res.json(result)
}

export async function createReviewHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const body = createBodySchema.parse(req.body)
  const result = await createReviewForUser({
    userId,
    applicationId: body.applicationId,
    content: body.content,
    rating: body.rating,
    imageUrl: body.imageUrl ?? null,
  })
  res.status(201).json(result)
}

export async function updateReviewHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const { id } = idParamSchema.parse(req.params)
  const body = updateBodySchema.parse(req.body)
  const result = await updateReviewForUser({
    reviewId: id,
    userId,
    content: body.content,
    rating: body.rating,
    imageUrl: body.imageUrl ?? null,
  })
  res.json(result)
}

// ─────────────── 관리자 ───────────────

export async function adminListReviewsHandler(req: Request, res: Response): Promise<void> {
  const query = adminListQuerySchema.parse(req.query)
  const result = await adminListReviews(query)
  res.json(result)
}

export async function adminDeleteReviewHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  await adminDeleteReview(id)
  res.status(204).send()
}
