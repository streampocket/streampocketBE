import { Request, Response } from 'express'
import { z } from 'zod'
import { getOrders, getOrderDetail, retryOrder } from '../services/steamOrderService'

const listQuerySchema = z.object({
  status: z.enum(['pending', 'completed', 'manual_review', 'failed']).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export async function getOrdersHandler(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query)
  const result = await getOrders({
    status: query.status,
    from: query.from ? new Date(query.from) : undefined,
    to: query.to ? new Date(query.to) : undefined,
    page: query.page,
    pageSize: query.pageSize,
  })
  res.json({
    data: result.items,
    total: result.total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.ceil(result.total / query.pageSize),
  })
}

export async function getOrderDetailHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  const order = await getOrderDetail(id)
  res.json({ data: order })
}

export async function retryOrderHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  await retryOrder(id)
  res.json({ message: '재시도 완료' })
}
