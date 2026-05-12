import { z } from 'zod'
import type { Request, Response } from 'express'
import {
  createOwnProductItem,
  getOwnProducts,
  getOwnProductDetail,
  adminUpdateOwnProduct,
  adminDeleteOwnProduct,
  adminGetOwnProductDetailWithApplications,
  adminGetOwnProductCredentials,
  adminUpdatePartyStatus,
} from '../../services/own/ownProductService'

// ───────────────────────── Zod 스키마 ─────────────────────────

const adminCreateOwnProductSchema = z.object({
  name: z.string().min(1).max(255),
  durationDays: z.number().int().positive(),
  price: z.number().int().positive(),
  dailyDiscount: z.number().int().min(0).default(0),
  totalSlots: z.number().int().min(1),
  imagePath: z.string().max(500).optional().nullable(),
  notes: z.string().optional().nullable(),
  accountId: z.string().max(255).optional().nullable(),
  accountPassword: z.string().max(255).optional().nullable(),
  leaderName: z.string().min(1).max(100),
})

const adminUpdateOwnProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  durationDays: z.number().int().positive().optional(),
  price: z.number().int().positive().optional(),
  dailyDiscount: z.number().int().min(0).optional(),
  totalSlots: z.number().int().min(1).optional(),
  imagePath: z.string().max(500).optional().nullable(),
  notes: z.string().optional().nullable(),
  accountId: z.string().max(255).optional().nullable(),
  accountPassword: z.string().max(255).optional().nullable(),
  leaderName: z.string().min(1).max(100).optional(),
})

const listQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  status: z.enum(['recruiting', 'closed', 'expired']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})

const adminListQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  status: z.enum(['recruiting', 'closed', 'expired']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

const statusUpdateSchema = z.object({
  status: z.enum(['recruiting', 'closed', 'expired']),
})

const idParamSchema = z.object({
  id: z.string().uuid(),
})

// ───────────────────────── 사용자(공개) 핸들러 ─────────────────────────

export async function getOwnProductsHandler(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query)
  const result = await getOwnProducts(query)
  res.json({ data: result.data })
}

export async function getOwnProductDetailHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const product = await getOwnProductDetail(id)
  res.json({ data: product })
}

// ───────────────────────── 관리자용 핸들러 ─────────────────────────

export async function adminCreateOwnProductHandler(req: Request, res: Response): Promise<void> {
  const body = adminCreateOwnProductSchema.parse(req.body)
  const product = await createOwnProductItem(body)
  res.status(201).json({ data: product })
}

export async function adminGetOwnProductsHandler(req: Request, res: Response): Promise<void> {
  const query = adminListQuerySchema.parse(req.query)
  const result = await getOwnProducts(query)
  res.json(result)
}

export async function adminGetOwnProductDetailHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const product = await adminGetOwnProductDetailWithApplications(id)
  res.json({ data: product })
}

export async function adminGetOwnProductCredentialsHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const credentials = await adminGetOwnProductCredentials(id)
  res.json({ data: credentials })
}

export async function adminUpdatePartyStatusHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const { status } = statusUpdateSchema.parse(req.body)
  const product = await adminUpdatePartyStatus(id, status)
  res.json({ data: product })
}

export async function adminUpdateOwnProductHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const body = adminUpdateOwnProductSchema.parse(req.body)
  const product = await adminUpdateOwnProduct(id, body)
  res.json({ data: product })
}

export async function adminDeleteOwnProductHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  await adminDeleteOwnProduct(id)
  res.status(204).send()
}
