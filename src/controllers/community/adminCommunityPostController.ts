import type { Request, Response } from 'express'
import { z } from 'zod'
import {
  createPostByAdmin,
  deletePostByAdmin,
  issueAdminImageUploadUrl,
  listPostsForAdmin,
  updatePostByAdmin,
} from '../../services/community/communityPostService'

const idParamSchema = z.object({ id: z.string().uuid() })

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  category: z.enum(['notice', 'free']).optional(),
})

const createBodySchema = z.object({
  category: z.enum(['notice', 'free']),
  title: z.string().trim().min(1).max(100),
  content: z.string().trim().min(1).max(5000),
  imageUrl: z.string().url().max(500).nullable().optional(),
  isPinned: z.boolean().optional().default(false),
})

const updateBodySchema = z.object({
  category: z.enum(['notice', 'free']),
  title: z.string().trim().min(1).max(100),
  content: z.string().trim().min(1).max(5000),
  imageUrl: z.string().url().max(500).nullable().optional(),
  isPinned: z.boolean().optional().default(false),
})

const presignBodySchema = z.object({
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  contentLength: z.number().int().min(1).max(5 * 1024 * 1024),
})

export async function adminListPostsHandler(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query)
  const result = await listPostsForAdmin(query)
  res.json(result)
}

export async function adminIssueImageUploadUrlHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const adminId = req.user!.id
  const body = presignBodySchema.parse(req.body)
  const result = await issueAdminImageUploadUrl({ adminId, ...body })
  res.json(result)
}

export async function adminCreatePostHandler(req: Request, res: Response): Promise<void> {
  const adminId = req.user!.id
  const body = createBodySchema.parse(req.body)
  const result = await createPostByAdmin({
    adminId,
    category: body.category,
    title: body.title,
    content: body.content,
    imageUrl: body.imageUrl ?? null,
    isPinned: body.isPinned,
  })
  res.status(201).json(result)
}

export async function adminUpdatePostHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const body = updateBodySchema.parse(req.body)
  const result = await updatePostByAdmin({
    postId: id,
    category: body.category,
    title: body.title,
    content: body.content,
    imageUrl: body.imageUrl ?? null,
    isPinned: body.isPinned,
  })
  res.json(result)
}

export async function adminDeletePostHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  await deletePostByAdmin({ postId: id })
  res.status(204).send()
}
