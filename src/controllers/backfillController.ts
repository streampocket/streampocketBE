import { Request, Response } from 'express'
import { backfillDecisionDates } from '../services/backfillService'

export async function backfillDecisionDatesHandler(_req: Request, res: Response): Promise<void> {
  const result = await backfillDecisionDates()
  res.json({ data: result })
}
