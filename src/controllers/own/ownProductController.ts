import { z } from 'zod'
import type { Request, Response } from 'express'
import {
  createOwnProductItem,
  getOwnProducts,
  getMyOwnProducts,
  getOwnProductDetail,
  updateOwnProductItem,
  closeOwnProduct,
  deleteOwnProductItem,
  adminUpdateOwnProduct,
  adminDeleteOwnProduct,
} from '../../services/own/ownProductService'

// ───────────────────────── Zod 스키마 ─────────────────────────

const createOwnProductSchema = z.object({
  name: z.string().min(1).max(255),
  durationDays: z.number().int().positive(),
  price: z.number().int().positive(),
  totalSlots: z.number().int().min(1),
  imagePath: z.string().max(500).optional().nullable(),
  notes: z.string().optional().nullable(),
})

const updateOwnProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  durationDays: z.number().int().positive().optional(),
  price: z.number().int().positive().optional(),
  totalSlots: z.number().int().min(1).optional(),
  imagePath: z.string().max(500).optional().nullable(),
  notes: z.string().optional().nullable(),
})

const listQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  status: z.enum(['recruiting', 'closed', 'expired']).optional(),
})

const idParamSchema = z.object({
  id: z.string().uuid(),
})

// ───────────────────────── 유저용 핸들러 ─────────────────────────

export async function createOwnProductHandler(req: Request, res: Response): Promise<void> {
  const body = createOwnProductSchema.parse(req.body)
  const userId = req.user!.id
  const product = await createOwnProductItem({ ...body, userId })
  res.status(201).json({ data: product })
}

export async function getOwnProductsHandler(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query)
  const products = await getOwnProducts(query)
  res.json({ data: products })
}

export async function getMyOwnProductsHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const products = await getMyOwnProducts(userId)
  res.json({ data: products })
}

export async function getOwnProductDetailHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const product = await getOwnProductDetail(id)
  res.json({ data: product })
}

export async function updateOwnProductHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const body = updateOwnProductSchema.parse(req.body)
  const userId = req.user!.id
  const product = await updateOwnProductItem(id, userId, body)
  res.json({ data: product })
}

export async function closeOwnProductHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const userId = req.user!.id
  const product = await closeOwnProduct(id, userId)
  res.json({ data: product })
}

export async function deleteOwnProductHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const userId = req.user!.id
  await deleteOwnProductItem(id, userId)
  res.status(204).send()
}

// ───────────────────────── 관리자용 핸들러 ─────────────────────────

export async function adminGetOwnProductsHandler(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query)
  const products = await getOwnProducts(query)
  res.json({ data: products })
}

export async function adminGetOwnProductDetailHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const product = await getOwnProductDetail(id)
  res.json({ data: product })
}

export async function adminUpdateOwnProductHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const body = updateOwnProductSchema.parse(req.body)
  const product = await adminUpdateOwnProduct(id, body)
  res.json({ data: product })
}

export async function adminDeleteOwnProductHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  await adminDeleteOwnProduct(id)
  res.status(204).send()
}
