import { Request, Response } from 'express'
import { z } from 'zod'
import { getCodes, bulkCreate, disable } from '../services/steamCodeService'

const bulkCreateSchema = z.object({
  productId: z.string().uuid(),
  codes: z.array(z.string().min(1)).min(1),
})

const listQuerySchema = z.object({
  productId: z.string().uuid().optional(),
  status: z.enum(['available', 'reserved', 'sent', 'disabled']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export async function getCodesHandler(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query)
  const result = await getCodes(query)
  res.json({
    data: result.items,
    total: result.total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.ceil(result.total / query.pageSize),
  })
}

export async function bulkCreateCodesHandler(req: Request, res: Response): Promise<void> {
  const body = bulkCreateSchema.parse(req.body)
  const result = await bulkCreate(body)
  res.status(201).json({ data: result })
}

export async function disableCodeHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  const code = await disable(id)
  res.json({ data: code })
}
