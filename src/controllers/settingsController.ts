import { Request, Response } from 'express'
import { z } from 'zod'
import {
  getCommissionRate,
  updateCommissionRate,
  getAlimtalkUnitCost,
  updateAlimtalkUnitCost,
} from '../services/settingsService'

const commissionRateSchema = z.object({
  rate: z.number().min(0).max(100),
})

const alimtalkUnitCostSchema = z.object({
  cost: z.number().min(0).max(1000),
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

export async function getAlimtalkUnitCostHandler(_req: Request, res: Response): Promise<void> {
  const cost = await getAlimtalkUnitCost()
  res.json({ data: { cost } })
}

export async function updateAlimtalkUnitCostHandler(req: Request, res: Response): Promise<void> {
  const { cost } = alimtalkUnitCostSchema.parse(req.body)
  const updated = await updateAlimtalkUnitCost(cost)
  res.json({ data: { cost: updated } })
}
