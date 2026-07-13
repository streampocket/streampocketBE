import { z } from 'zod'
import type { Request, Response } from 'express'
import {
  createBuyerGcoinOrder,
  getBuyerGcoinOrders,
  adminGetGcoinOrders,
  adminApproveGcoinOrder,
  adminRejectGcoinOrder,
} from '../../services/gcoin/gcoinOrderService'

const createOrderSchema = z.object({
  productId: z.string().uuid(),
})

const adminListQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

const rejectBodySchema = z.object({
  reason: z.string().max(500).optional().nullable(),
})

const idParamSchema = z.object({
  id: z.string().uuid(),
})

function getBuyerPhoneOrThrow(req: Request): string {
  const phone = req.gcoinBuyer?.phone
  if (!phone) {
    throw Object.assign(new Error('휴대폰 인증이 필요합니다.'), { statusCode: 401 })
  }
  return phone
}

// ───────────────────────── 구매자 ─────────────────────────

export async function createGcoinOrderHandler(req: Request, res: Response): Promise<void> {
  const phone = getBuyerPhoneOrThrow(req)
  const { productId } = createOrderSchema.parse(req.body)
  const order = await createBuyerGcoinOrder(phone, productId)
  res.status(201).json({ data: order })
}

export async function getMyGcoinOrdersHandler(req: Request, res: Response): Promise<void> {
  const phone = getBuyerPhoneOrThrow(req)
  const result = await getBuyerGcoinOrders(phone)
  res.json(result)
}

// ───────────────────────── 관리자 ─────────────────────────

export async function adminGetGcoinOrdersHandler(req: Request, res: Response): Promise<void> {
  const query = adminListQuerySchema.parse(req.query)
  const result = await adminGetGcoinOrders(query)
  res.json(result)
}

export async function adminApproveGcoinOrderHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const order = await adminApproveGcoinOrder(id)
  res.json({ data: order })
}

export async function adminRejectGcoinOrderHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const { reason } = rejectBodySchema.parse(req.body ?? {})
  const order = await adminRejectGcoinOrder(id, reason ?? null)
  res.json({ data: order })
}
