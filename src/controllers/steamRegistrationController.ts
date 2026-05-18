import { Request, Response } from 'express'
import { z } from 'zod'
import {
  getRegistrationByOrderItem,
  getRegistrationDetail,
  linkOrder,
  listRegistrations,
  unlinkOrder,
  updateRegistrationByAdmin,
} from '../services/steamRegistrationService'

const listQuerySchema = z.object({
  status: z.enum(['received', 'needs_info', 'completed']).optional(),
  matchStatus: z.enum(['unmatched', 'auto_matched', 'manual_matched']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export async function getRegistrationsHandler(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query)
  const result = await listRegistrations({
    status: query.status,
    matchStatus: query.matchStatus,
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

const byOrderQuerySchema = z.object({
  orderItemId: z.string().trim().min(1),
})

// 주문 상세 모달용 — 연결된 접수가 없으면 data: null
export async function getRegistrationByOrderHandler(req: Request, res: Response): Promise<void> {
  const { orderItemId } = byOrderQuerySchema.parse(req.query)
  const registration = await getRegistrationByOrderItem(orderItemId)
  res.json({ data: registration })
}

export async function getRegistrationDetailHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const registration = await getRegistrationDetail(req.params.id)
  res.json({ data: registration })
}

const updateBodySchema = z.object({
  steamId: z.string().trim().max(255).nullable().optional(),
  steamPassword: z.string().trim().max(255).nullable().optional(),
  gameName: z.string().trim().max(255).nullable().optional(),
  buyerName: z.string().trim().max(100).nullable().optional(),
  steamGuardCodes: z.string().trim().max(2000).nullable().optional(),
  steamGuardDisabled: z.boolean().nullable().optional(),
  refundConsent: z.boolean().optional(),
  adminMemo: z.string().max(2000).nullable().optional(),
  status: z.enum(['received', 'needs_info', 'completed']).optional(),
})

export async function updateRegistrationHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const body = updateBodySchema.parse(req.body)
  const registration = await updateRegistrationByAdmin(req.params.id, body)
  res.json({ data: registration })
}

const linkBodySchema = z.object({
  orderItemId: z.string().trim().min(1),
})

export async function linkOrderHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { orderItemId } = linkBodySchema.parse(req.body)
  const registration = await linkOrder(req.params.id, orderItemId)
  res.json({ data: registration })
}

export async function unlinkOrderHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const registration = await unlinkOrder(req.params.id)
  res.json({ data: registration })
}
