import 'dotenv/config'
import { app } from './app'
import {
  runBackupOrderScan,
  runDailyOrderReconciliation,
  runOrderPolling,
} from './services/steamFulfillmentService'
import { naverOrderSource } from './services/platform/naverOrderSource'
import { generateWeeklySettlement } from './services/settlementService'
import { expireOldParties } from './services/own/ownProductService'
import { sendDailyExpenseSummary } from './services/expenseSummaryService'

const PORT = Number(process.env.PORT ?? 4000)
const POLL_INTERVAL_MS = Number(process.env['ORDER_POLL_INTERVAL_SECONDS'] ?? 300) * 1000
const BACKUP_SCAN_INTERVAL_MS = 15 * 60 * 1000
const BACKUP_SCAN_HOURS_BACK = 6

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`)
  console.log(`Swagger: http://localhost:${PORT}/api/docs`)

  // 주문 폴링
  runOrderPolling(naverOrderSource, 'startup').catch(console.error)

  setInterval(() => {
    runOrderPolling(naverOrderSource, 'interval').catch(console.error)
  }, POLL_INTERVAL_MS)

  console.log(`주문 폴링 시작: ${POLL_INTERVAL_MS / 1000}초 간격`)

  // 주문 보조 스캔 (15분 주기 — 네이버 last-changed-statuses 누락 대비)
  setInterval(() => {
    runBackupOrderScan(naverOrderSource, BACKUP_SCAN_HOURS_BACK).catch(console.error)
  }, BACKUP_SCAN_INTERVAL_MS)

  console.log(`주문 보조 스캔 시작: ${BACKUP_SCAN_INTERVAL_MS / 1000}초 간격`)

  // 일일 주문 누락 대조 스케줄러 (매일 09:00 KST)
  let lastReconcileDate = ''

  setInterval(() => {
    const now = new Date()
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    const today = kst.toISOString().slice(0, 10)
    const hour = kst.getUTCHours()
    const minute = kst.getUTCMinutes()

    if (hour === 9 && minute === 0 && lastReconcileDate !== today) {
      lastReconcileDate = today
      console.log('[DAILY_RECONCILE] 일일 주문 누락 대조 실행')
      runDailyOrderReconciliation(naverOrderSource).catch((err) => {
        console.error('[DAILY_RECONCILE] 일일 대조 실패', err)
      })
    }
  }, 60_000)

  console.log('일일 주문 누락 대조 스케줄러 시작: 매일 09:00 KST')

  // 주간 정산 스케줄러 (매주 금요일 23:59 KST)
  let lastSettlementDate = ''

  setInterval(() => {
    const now = new Date()
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    const day = kst.getUTCDay()
    const hour = kst.getUTCHours()
    const minute = kst.getUTCMinutes()
    const today = kst.toISOString().slice(0, 10)

    if (day === 5 && hour === 23 && minute === 59 && lastSettlementDate !== today) {
      lastSettlementDate = today
      console.log('[SETTLEMENT] 주간 정산 실행')
      generateWeeklySettlement().catch((err) => {
        console.error('[SETTLEMENT] 주간 정산 실패', err)
      })
    }
  }, 60_000)

  console.log('주간 정산 스케줄러 시작: 매주 금요일 23:59')

  // 파티원 만료 스케줄러 (매일 00:00 KST)
  let lastExpireDate = ''

  setInterval(() => {
    const now = new Date()
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    const today = kst.toISOString().slice(0, 10)
    const hour = kst.getUTCHours()
    const minute = kst.getUTCMinutes()

    if (hour === 0 && minute === 0 && lastExpireDate !== today) {
      lastExpireDate = today
      console.log('[PARTY_EXPIRE] 파티원 만료 처리 실행')
      expireOldParties().catch((err) => {
        console.error('[PARTY_EXPIRE] 파티원 만료 처리 실패', err)
      })
    }
  }, 60_000)

  console.log('파티원 만료 스케줄러 시작: 매일 00:00')

  // 일일 비용 요약 스케줄러 (매일 23:50 KST)
  let lastExpenseSummaryDate = ''

  setInterval(() => {
    const now = new Date()
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    const today = kst.toISOString().slice(0, 10)
    const hour = kst.getUTCHours()
    const minute = kst.getUTCMinutes()

    if (hour === 23 && minute === 50 && lastExpenseSummaryDate !== today) {
      lastExpenseSummaryDate = today
      console.log('[EXPENSE_SUMMARY] 일일 비용 요약 전송')
      sendDailyExpenseSummary().catch((err) => {
        console.error('[EXPENSE_SUMMARY] 일일 비용 요약 전송 실패', err)
      })
    }
  }, 60_000)

  console.log('일일 비용 요약 스케줄러 시작: 매일 23:50')
})
