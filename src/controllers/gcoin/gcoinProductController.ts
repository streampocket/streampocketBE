import { z } from 'zod'
import type { Request, Response } from 'express'
import {
  adminCreateGcoinProduct,
  adminGetGcoinProducts,
  adminGetGcoinProductDetail,
  adminUpdateGcoinProduct,
  adminDeleteGcoinProduct,
  issueGcoinProductImageUploadUrl,
  getPublicGcoinProducts,
  getPublicGcoinProductDetail,
} from '../../services/gcoin/gcoinProductService'

// ───────────────────────── Zod 스키마 ─────────────────────────

const statusEnum = z.enum(['on_sale', 'hidden', 'sold_out'])
const categoryEnum = z.enum(['gcoin', 'item'])

const adminCreateGcoinProductSchema = z.object({
  name: z.string().min(1).max(255),
  category: categoryEnum.default('gcoin'),
  gcoinAmount: z.number().int().positive().optional().nullable(),
  salePrice: z.number().int().min(0),
  listPrice: z.number().int().min(0).optional().nullable(),
  listPriceUsd: z.number().positive().max(1_000_000).optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  status: statusEnum.default('hidden'),
})

const adminUpdateGcoinProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: categoryEnum.optional(),
  gcoinAmount: z.number().int().positive().optional().nullable(),
  salePrice: z.number().int().min(0).optional(),
  listPrice: z.number().int().min(0).optional().nullable(),
  listPriceUsd: z.number().positive().max(1_000_000).optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  status: statusEnum.optional(),
})

const adminListQuerySchema = z.object({
  status: statusEnum.optional(),
  category: categoryEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

const presignBodySchema = z.object({
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  contentLength: z.number().int().min(1).max(5 * 1024 * 1024),
})

const idParamSchema = z.object({
  id: z.string().uuid(),
})

// ───────────────────────── 관리자용 핸들러 ─────────────────────────

export async function adminCreateGcoinProductHandler(req: Request, res: Response): Promise<void> {
  const body = adminCreateGcoinProductSchema.parse(req.body)
  const product = await adminCreateGcoinProduct(body)
  res.status(201).json({ data: product })
}

export async function adminGetGcoinProductsHandler(req: Request, res: Response): Promise<void> {
  const query = adminListQuerySchema.parse(req.query)
  const result = await adminGetGcoinProducts(query)
  res.json(result)
}

export async function adminGetGcoinProductDetailHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const product = await adminGetGcoinProductDetail(id)
  res.json({ data: product })
}

export async function adminUpdateGcoinProductHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const body = adminUpdateGcoinProductSchema.parse(req.body)
  const product = await adminUpdateGcoinProduct(id, body)
  res.json({ data: product })
}

export async function adminDeleteGcoinProductHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  await adminDeleteGcoinProduct(id)
  res.status(204).send()
}

export async function adminIssueGcoinImageUploadUrlHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const body = presignBodySchema.parse(req.body)
  const result = await issueGcoinProductImageUploadUrl(body)
  res.json(result)
}

// ───────────────────────── 공개 핸들러 (gcoin 사이트) ─────────────────────────

export async function getPublicGcoinProductsHandler(_req: Request, res: Response): Promise<void> {
  const result = await getPublicGcoinProducts()
  res.json(result)
}

export async function getPublicGcoinProductDetailHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const product = await getPublicGcoinProductDetail(id)
  res.json({ data: product })
}
