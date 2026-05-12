import type { Request, Response } from 'express'
import { sendDailySalesReport } from '../services/dailySalesReportService'

export async function dailySalesReportHandler(_req: Request, res: Response): Promise<void> {
  await sendDailySalesReport()
  res.json({ message: '일일 매출 리포트 전송 완료' })
}
