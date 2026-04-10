import { z } from 'zod'
import type { Request, Response } from 'express'
import { getUsers, getUserDetail } from '../../services/own/adminUserService'

// ───────────────────────── Zod 스키마 ─────────────────────────

const listQuerySchema = z.object({
  search: z.string().optional(),
  provider: z.enum(['local', 'kakao', 'google']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

const idParamSchema = z.object({
  id: z.string().uuid(),
})

// ───────────────────────── 관리자용 핸들러 ─────────────────────────

export async function adminGetUsersHandler(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query)
  const result = await getUsers(query)
  res.json(result)
}

export async function adminGetUserDetailHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const detail = await getUserDetail(id)
  res.json({ data: detail })
}
