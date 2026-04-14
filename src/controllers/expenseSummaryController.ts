import type { Request, Response } from 'express'
import { sendDailyExpenseSummary } from '../services/expenseSummaryService'

export async function dailyExpenseSummaryHandler(_req: Request, res: Response): Promise<void> {
  await sendDailyExpenseSummary()
  res.json({ message: '일일 비용 요약 전송 완료' })
}
