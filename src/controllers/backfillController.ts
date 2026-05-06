import { Request, Response } from 'express'
import { backfillDecisionDates, backfillPaymentAmounts } from '../services/backfillService'

export async function backfillDecisionDatesHandler(_req: Request, res: Response): Promise<void> {
  const result = await backfillDecisionDates()
  res.json({ data: result })
}

export async function backfillPaymentAmountsHandler(_req: Request, res: Response): Promise<void> {
  const result = await backfillPaymentAmounts()
  res.json({ data: result })
}
