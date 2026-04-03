import { Request, Response } from 'express'
import { z } from 'zod'
import { getAlimtalkUnitCost, updateAlimtalkUnitCost } from '../services/settingsService'

const alimtalkUnitCostSchema = z.object({
  cost: z.number().min(0).max(1000),
})

export async function getAlimtalkUnitCostHandler(_req: Request, res: Response): Promise<void> {
  const cost = await getAlimtalkUnitCost()
  res.json({ data: { cost } })
}

export async function updateAlimtalkUnitCostHandler(req: Request, res: Response): Promise<void> {
  const { cost } = alimtalkUnitCostSchema.parse(req.body)
  const updated = await updateAlimtalkUnitCost(cost)
  res.json({ data: { cost: updated } })
}
