import { Request, Response } from 'express'
import { generateWeeklySettlement } from '../services/settlementService'

export async function weeklySettlementHandler(_req: Request, res: Response): Promise<void> {
  await generateWeeklySettlement()
  res.json({ data: { message: 'ok' } })
}
