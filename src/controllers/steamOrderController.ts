import { Request, Response } from 'express'
import { z } from 'zod'
import {
  getOrders,
  getOrderDetail,
  retryOrder,
  manualReturnOrder,
  exportOrdersForExcel,
  updateFriendLinks,
  markGiftCompleted,
} from '../services/steamOrderService'
import { buildOrderExcelBuffer } from '../utils/excel'

const listQuerySchema = z.object({
  status: z.enum(['pending', 'completed', 'manual_review', 'failed', 'returned']).optional(),
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

const exportQuerySchema = z.object({
  status: z.enum(['pending', 'completed', 'manual_review', 'failed', 'returned']).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
})

export async function exportOrdersHandler(req: Request, res: Response): Promise<void> {
  const query = exportQuerySchema.parse(req.query)
  const orders = await exportOrdersForExcel({
    status: query.status,
    from: query.from ? new Date(query.from) : undefined,
    to: query.to ? new Date(query.to) : undefined,
  })
  const buffer = buildOrderExcelBuffer(orders)
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="orders_${date}.xlsx"`)
  res.send(buffer)
}

export async function retryOrderHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  await retryOrder(id)
  res.json({ message: '재시도 완료' })
}

export async function manualReturnHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  await manualReturnOrder(id)
  res.json({ message: '반품 처리 완료' })
}

const friendLinksBodySchema = z.object({
  friendLink1: z.string().trim().url().max(500).nullable().optional(),
  friendLink2: z.string().trim().url().max(500).nullable().optional(),
})

export async function updateFriendLinksHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  const body = friendLinksBodySchema.parse(req.body)
  await updateFriendLinks(id, body)
  res.json({ message: '친구 링크가 저장되었습니다.' })
}

export async function markGiftCompletedHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  await markGiftCompleted(id)
  res.json({ message: '선물 접수 완료 처리되었습니다.' })
}
