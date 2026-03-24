import { Request, Response } from 'express'
import { z } from 'zod'

const bulkCreateSchema = z.object({
  productId: z.string().uuid(),
  codes: z.array(z.string().min(1)).min(1),
})

const listQuerySchema = z.object({
  productId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export async function getCodes(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query)
  void query
  // TODO: codeService.getCodes(query) 구현
  res.status(501).json({ message: '미구현' })
}

export async function bulkCreateCodes(req: Request, res: Response): Promise<void> {
  const body = bulkCreateSchema.parse(req.body)
  void body
  // TODO: codeService.bulkCreate(body) 구현
  res.status(501).json({ message: '미구현' })
}
