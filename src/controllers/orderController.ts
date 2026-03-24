import { Request, Response } from 'express'
import { z } from 'zod'

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  platform: z.enum(['NAVER', 'OWN']).optional(),
  status: z.string().optional(),
})

export async function getOrders(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query)
  // TODO: orderService.getOrders(query) 구현
  void query
  res.status(501).json({ message: '미구현' })
}

export async function getOrderDetail(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  // TODO: orderService.getOrderDetail(id) 구현
  void id
  res.status(501).json({ message: '미구현' })
}
