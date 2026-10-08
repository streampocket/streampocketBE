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
  listReviewIdsForSitemap,
  updateReviewForUser,
} from '../../services/own/ownReviewService'
import { REVIEW_CONTENT_MIN_LENGTH, countReviewContentChars } from '../../utils/reviewContent'

const idParamSchema = z.object({ id: z.string().uuid() })

// 작성·수정 공통 — 성의 없는 짧은 리뷰를 막기 위해 공백 제외 최소 글자 수를 둔다.
// 기존에 짧게 저장된 리뷰도 수정해서 저장하려면 이 기준을 넘어야 한다.
const reviewContentSchema = z
  .string()
  .trim()
  .max(2000)
  .refine((text) => countReviewContentChars(text) >= REVIEW_CONTENT_MIN_LENGTH, {
    message: `리뷰는 공백을 제외하고 ${REVIEW_CONTENT_MIN_LENGTH}자 이상 입력해 주세요.`,
  })

const listQuerySchema = z.object({
  productId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  sort: z.enum(['latest', 'rating']).default('latest'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
})

// 리뷰 대상은 원 신청(applicationId) 또는 재구매(renewalId) 중 정확히 하나
const createBodySchema = z
  .object({
    applicationId: z.string().uuid().optional(),
    renewalId: z.string().uuid().optional(),
    content: reviewContentSchema,
    rating: z.number().int().min(1).max(5),
    imageUrl: z.string().url().max(500).nullable().optional(),
  })
  .refine((body) => (body.applicationId === undefined) !== (body.renewalId === undefined), {
    message: '리뷰 대상 파티를 선택해 주세요.',
  })

const updateBodySchema = z.object({
  content: reviewContentSchema,
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

// sitemap 생성용 — id·updatedAt만
export async function getReviewsSitemapHandler(_req: Request, res: Response): Promise<void> {
  const items = await listReviewIdsForSitemap()
  res.json({ items })
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
  // refine이 정확히 하나를 보장한다 — 타입을 좁히기 위해 다시 분기
  const target = body.renewalId
    ? { renewalId: body.renewalId }
    : { applicationId: body.applicationId ?? '' }
  const result = await createReviewForUser({
    userId,
    ...target,
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
