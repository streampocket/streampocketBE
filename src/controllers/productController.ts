import { Request, Response } from 'express'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().min(0),
  internalProductCode: z.string().min(1),
  naverProductId: z.string().optional(),
  sellerManagementCode: z.string().min(1),
  emailOptionName: z.string().min(1),
})

export async function getProducts(_req: Request, res: Response): Promise<void> {
  // TODO: productService.getProducts() 구현
  res.status(501).json({ message: '미구현' })
}

export async function getProductDetail(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  void id
  // TODO: productService.getProductDetail(id) 구현
  res.status(501).json({ message: '미구현' })
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  const body = createProductSchema.parse(req.body)
  void body
  // TODO: productService.createProduct(body) 구현
  res.status(501).json({ message: '미구현' })
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  void id
  // TODO: productService.updateProduct(id, body) 구현
  res.status(501).json({ message: '미구현' })
}
