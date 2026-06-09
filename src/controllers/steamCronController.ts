import { Request, Response } from 'express'
import {
  runBackupOrderScan,
  runDailyOrderReconciliation,
  runOrderPolling,
} from '../services/steamFulfillmentService'
import { createNaverOrderSource } from '../services/platform/naverOrderSource'
import { hasStoreCredentials } from '../lib/naverAuth'
import { STORES } from '../constants/stores'
import { runZqbgGiftStatusPolling } from '../services/zqbgPollingService'
import { runAutoExtendCheck } from '../services/steamOrderService'

const BACKUP_SCAN_HOURS_BACK = 6

export async function pollOrders(_req: Request, res: Response): Promise<void> {
  const results = []
  for (const store of STORES) {
    if (!hasStoreCredentials(store)) continue
    results.push({ store, ...(await runOrderPolling(createNaverOrderSource(store), 'manual', store)) })
  }
  res.json({ message: '주문 폴링 완료', results })
}

export async function backupScanOrders(_req: Request, res: Response): Promise<void> {
  const results = []
  for (const store of STORES) {
    if (!hasStoreCredentials(store)) continue
    results.push({ store, ...(await runBackupOrderScan(createNaverOrderSource(store), BACKUP_SCAN_HOURS_BACK, store)) })
  }
  res.json({ message: '보조 스캔 완료', results })
}

export async function dailyReconcileOrders(_req: Request, res: Response): Promise<void> {
  const results = []
  for (const store of STORES) {
    if (!hasStoreCredentials(store)) continue
    results.push({ store, ...(await runDailyOrderReconciliation(createNaverOrderSource(store), store)) })
  }
  res.json({ message: '일일 대조 완료', results })
}

export async function zqbgPollOrders(_req: Request, res: Response): Promise<void> {
  const result = await runZqbgGiftStatusPolling()
  res.json({ message: 'zqbg 발송상태 폴링 완료', ...result })
}

export async function autoExtendCheckHandler(_req: Request, res: Response): Promise<void> {
  const result = await runAutoExtendCheck()
  res.json({ message: '예상 완료시각 자동 연장 점검 완료', ...result })
}
