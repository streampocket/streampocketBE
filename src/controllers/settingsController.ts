import { Request, Response } from 'express'
import { z } from 'zod'
import {
  getCommissionRate,
  updateCommissionRate,
  getMonthlyAdjustment,
  updateMonthlyAdjustment,
} from '../services/settingsService'

const commissionRateSchema = z.object({
  rate: z.number().min(0).max(100),
})

const yearMonthParamSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)

const adjustmentBodySchema = z.object({
  paymentAdjustment: z.number().int(),
  commissionAdjustment: z.number().int(),
  netRevenueAdjustment: z.number().int(),
  memo: z.string().max(500).optional(),
})

export async function getCommissionRateHandler(_req: Request, res: Response): Promise<void> {
  const rate = await getCommissionRate()
  res.json({ data: { rate } })
}

export async function updateCommissionRateHandler(req: Request, res: Response): Promise<void> {
  const { rate } = commissionRateSchema.parse(req.body)
  const updated = await updateCommissionRate(rate)
  res.json({ data: { rate: updated } })
}

export async function getAdjustmentHandler(req: Request, res: Response): Promise<void> {
  const yearMonth = yearMonthParamSchema.parse(req.params.yearMonth)
  const adj = await getMonthlyAdjustment(yearMonth)
  res.json({ data: adj })
}

export async function updateAdjustmentHandler(req: Request, res: Response): Promise<void> {
  const yearMonth = yearMonthParamSchema.parse(req.params.yearMonth)
  const body = adjustmentBodySchema.parse(req.body)
  const adj = await updateMonthlyAdjustment(yearMonth, body)
  res.json({ data: adj })
}
