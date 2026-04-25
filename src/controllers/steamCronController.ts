import { Request, Response } from 'express'
import {
  runBackupOrderScan,
  runDailyOrderReconciliation,
  runOrderPolling,
} from '../services/steamFulfillmentService'
import { naverOrderSource } from '../services/platform/naverOrderSource'

const BACKUP_SCAN_HOURS_BACK = 6

export async function pollOrders(_req: Request, res: Response): Promise<void> {
  const result = await runOrderPolling(naverOrderSource, 'manual')
  res.json({ message: '주문 폴링 완료', ...result })
}

export async function backupScanOrders(_req: Request, res: Response): Promise<void> {
  const result = await runBackupOrderScan(naverOrderSource, BACKUP_SCAN_HOURS_BACK)
  res.json({ message: '보조 스캔 완료', ...result })
}

export async function dailyReconcileOrders(_req: Request, res: Response): Promise<void> {
  const result = await runDailyOrderReconciliation(naverOrderSource)
  res.json({ message: '일일 대조 완료', ...result })
}
