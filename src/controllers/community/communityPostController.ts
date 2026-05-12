import type { Request, Response } from 'express'
import { z } from 'zod'
import {
  createFreePostByUser,
  deletePostByUser,
  getPost,
  issueUserImageUploadUrl,
  listPostIdsForSitemap,
  listPostsForPublic,
  updatePostByUser,
} from '../../services/community/communityPostService'

const idParamSchema = z.object({ id: z.string().uuid() })

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  category: z.enum(['notice', 'free']).optional(),
})

const createBodySchema = z.object({
  title: z.string().trim().min(1).max(100),
  content: z.string().trim().min(1).max(5000),
  imageUrl: z.string().url().max(500).nullable().optional(),
})

const updateBodySchema = z.object({
  title: z.string().trim().min(1).max(100),
  content: z.string().trim().min(1).max(5000),
  imageUrl: z.string().url().max(500).nullable().optional(),
})

const presignBodySchema = z.object({
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  contentLength: z.number().int().min(1).max(5 * 1024 * 1024),
})

// ─────────────── 공개 ───────────────

export async function listPostsHandler(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query)
  const result = await listPostsForPublic(query)
  res.json(result)
}

export async function getPostHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const result = await getPost(id)
  res.json(result)
}

export async function listPostIdsHandler(_req: Request, res: Response): Promise<void> {
  const items = await listPostIdsForSitemap()
  res.json({ items })
}

// ─────────────── 회원 ───────────────

export async function issueImageUploadUrlHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const body = presignBodySchema.parse(req.body)
  const result = await issueUserImageUploadUrl({ userId, ...body })
  res.json(result)
}

export async function createPostHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const body = createBodySchema.parse(req.body)
  const result = await createFreePostByUser({
    userId,
    title: body.title,
    content: body.content,
    imageUrl: body.imageUrl ?? null,
  })
  res.status(201).json(result)
}

export async function updatePostHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const { id } = idParamSchema.parse(req.params)
  const body = updateBodySchema.parse(req.body)
  const result = await updatePostByUser({
    postId: id,
    userId,
    title: body.title,
    content: body.content,
    imageUrl: body.imageUrl ?? null,
  })
  res.json(result)
}

export async function deletePostHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const { id } = idParamSchema.parse(req.params)
  await deletePostByUser({ postId: id, userId })
  res.status(204).send()
}
