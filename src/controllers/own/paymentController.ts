import { z } from 'zod'
import type { Request, Response } from 'express'
import {
  getPayments,
  getPaymentDetail,
  approvePayment,
  rejectPayment,
  deletePayment,
} from '../../services/own/paymentService'

// ───────────────────────── Zod 스키마 ─────────────────────────

const listQuerySchema = z.object({
  status: z.enum(['pending', 'paid', 'cancelled']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

const idParamSchema = z.object({
  id: z.string().uuid(),
})

const actionBodySchema = z.object({
  adminNote: z.string().max(500).optional(),
})

// ───────────────────────── 관리자용 핸들러 ─────────────────────────

export async function adminGetPaymentsHandler(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query)
  const result = await getPayments(query)
  res.json(result)
}

export async function adminGetPaymentDetailHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const payment = await getPaymentDetail(id)
  res.json({ data: payment })
}

export async function adminApprovePaymentHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const { adminNote } = actionBodySchema.parse(req.body)
  const payment = await approvePayment(id, adminNote)
  res.json({ data: payment })
}

export async function adminRejectPaymentHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const { adminNote } = actionBodySchema.parse(req.body)
  const payment = await rejectPayment(id, adminNote)
  res.json({ data: payment })
}

export async function adminDeletePaymentHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  await deletePayment(id)
  res.json({ data: { message: 'ok' } })
}
