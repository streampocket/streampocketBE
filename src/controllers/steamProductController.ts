import { Request, Response } from 'express'
import { z } from 'zod'
import {
  getProducts,
  getProductDetail,
  createSteamProduct,
  updateSteamProduct,
  syncNaverProducts,
} from '../services/steamProductService'

const createProductSchema = z.object({
  name: z.string().min(1),
  naverProductId: z.string().min(1),
  description: z.string().optional(),
  caution: z.string().optional(),
  event: z.string().optional(),
})

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  caution: z.string().optional(),
  event: z.string().optional(),
  status: z.enum(['draft', 'active', 'inactive']).optional(),
})

const listQuerySchema = z.object({
  status: z.enum(['draft', 'active', 'inactive']).optional(),
})

export async function getProductsHandler(req: Request, res: Response): Promise<void> {
  const { status } = listQuerySchema.parse(req.query)
  const products = await getProducts(status)
  res.json({ data: products })
}

export async function getProductDetailHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  const product = await getProductDetail(id)
  res.json({ data: product })
}

export async function createProductHandler(req: Request, res: Response): Promise<void> {
  const body = createProductSchema.parse(req.body)
  const product = await createSteamProduct(body)
  res.status(201).json({ data: product })
}

export async function updateProductHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  const body = updateProductSchema.parse(req.body)
  const product = await updateSteamProduct(id, body)
  res.json({ data: product })
}

export async function syncProductsHandler(req: Request, res: Response): Promise<void> {
  const result = await syncNaverProducts()
  res.json({ data: result })
}
