import 'dotenv/config'
import { app } from './app'
import {
  OrderPollingTrigger,
  runBackupOrderScan,
  runDailyOrderReconciliation,
  runOrderPolling,
} from './services/steamFulfillmentService'
import { createNaverOrderSource } from './services/platform/naverOrderSource'
import { hasStoreCredentials } from './lib/naverAuth'
import { STORES } from './constants/stores'
import { runZqbgGiftStatusPolling } from './services/zqbgPollingService'
import { generateWeeklySettlement } from './services/settlementService'
import { expireOldParties } from './services/own/ownProductService'
import { sendDailySalesReport } from './services/dailySalesReportService'
import { runAutoExtendCheck } from './services/steamOrderService'
import { refreshUsdKrwRate } from './services/gcoin/exchangeRateService'

const PORT = Number(process.env.PORT ?? 4000)
const POLL_INTERVAL_MS = Number(process.env['ORDER_POLL_INTERVAL_SECONDS'] ?? 300) * 1000
const BACKUP_SCAN_INTERVAL_MS = 15 * 60 * 1000
const BACKUP_SCAN_HOURS_BACK = 6
const ZQBG_POLL_INTERVAL_MS = Number(process.env['ZQBG_POLL_INTERVAL_SECONDS'] ?? 120) * 1000

// 멀티스토어 — 스토어별 순차 처리(레이트리밋 회피) + 스토어 오류 격리(한 스토어 실패가 다른 스토어를 막지 않음).
async function pollAllStores(trigger: OrderPollingTrigger): Promise<void> {
  for (const store of STORES) {
    if (!hasStoreCredentials(store)) {
      console.log(`[ORDER_POLL] skip store=${store} reason=no_credentials`)
      continue
    }
    try {
      await runOrderPolling(createNaverOrderSource(store), trigger, store)
    } catch (err) {
      console.error(`[ORDER_POLL] store=${store} 실패`, err)
    }
  }
}

async function backupScanAllStores(): Promise<void> {
  for (const store of STORES) {
    if (!hasStoreCredentials(store)) continue
    try {
      await runBackupOrderScan(createNaverOrderSource(store), BACKUP_SCAN_HOURS_BACK, store)
    } catch (err) {
      console.error(`[BACKUP_SCAN] store=${store} 실패`, err)
    }
  }
}

async function reconcileAllStores(): Promise<void> {
  for (const store of STORES) {
    if (!hasStoreCredentials(store)) continue
    try {
      await runDailyOrderReconciliation(createNaverOrderSource(store), store)
    } catch (err) {
      console.error(`[DAILY_RECONCILE] store=${store} 실패`, err)
    }
  }
}

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`)
  console.log(`Swagger: http://localhost:${PORT}/api/docs`)

  // 주문 폴링 (스토어별 순차)
  pollAllStores('startup').catch(console.error)

  setInterval(() => {
    pollAllStores('interval').catch(console.error)
  }, POLL_INTERVAL_MS)

  console.log(`주문 폴링 시작: ${POLL_INTERVAL_MS / 1000}초 간격 (스토어 ${STORES.length}개 순차)`)

  // 주문 보조 스캔 (15분 주기 — 네이버 last-changed-statuses 누락 대비, 스토어별)
  setInterval(() => {
    backupScanAllStores().catch(console.error)
  }, BACKUP_SCAN_INTERVAL_MS)

  console.log(`주문 보조 스캔 시작: ${BACKUP_SCAN_INTERVAL_MS / 1000}초 간격`)

  // AA 선물주문 자동완료 — zqbg.cn 발송상태 폴링 (기본 2분 주기)
  setInterval(() => {
    runZqbgGiftStatusPolling().catch(console.error)
  }, ZQBG_POLL_INTERVAL_MS)

  console.log(`zqbg 선물 발송상태 폴링 시작: ${ZQBG_POLL_INTERVAL_MS / 1000}초 간격`)

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
      console.log('[DAILY_RECONCILE] 일일 주문 누락 대조 실행 (스토어별)')
      reconcileAllStores().catch((err) => {
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

  // 일일 종합 리포트 스케줄러 (매일 23:59 KST)
  let lastSalesReportDate = ''

  setInterval(() => {
    const now = new Date()
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    const today = kst.toISOString().slice(0, 10)
    const hour = kst.getUTCHours()
    const minute = kst.getUTCMinutes()

    // 주간 정산(금요일 23:59)과 동시에 트리거되지 않도록 금요일은 제외하고 토요일 00:00 직전까지 살핀다는 선택지도 있으나,
    // 주간 정산은 별도 채널 메시지이므로 동시 발송돼도 문제 없음.
    if (hour === 23 && minute === 59 && lastSalesReportDate !== today) {
      lastSalesReportDate = today
      console.log('[DAILY_REPORT] 일일 종합 리포트 전송')
      sendDailySalesReport().catch((err) => {
        console.error('[DAILY_REPORT] 일일 종합 리포트 전송 실패', err)
      })
    }
  }, 60_000)

  console.log('일일 종합 리포트 스케줄러 시작: 매일 23:59')

  // 진행중 주문 예상 완료시각 자동 +10분 연장 (1분 주기)
  // 트리거 조건은 service runAutoExtendCheck에서 처리: estimatedCompletedAt ≤ now+2분 + autoExtendCount<5
  setInterval(() => {
    runAutoExtendCheck().catch((err) => console.error('[AUTO_EXTEND] 실패', err))
  }, 60_000)

  console.log('주문 예상시각 자동 연장 스케줄러 시작: 1분 간격')

  // USD→KRW 환율 갱신 (매일 09:00 / 15:00 / 21:00 KST + 시작 시 1회)
  // 실패해도 DB의 마지막 저장값을 계속 쓰므로 로그만 남긴다
  const FX_REFRESH_HOURS = [9, 15, 21]
  let lastFxRefreshKey = ''

  refreshUsdKrwRate()
    .then(({ rate }) => console.log(`[FX_RATE] 시작 시 환율 갱신: USD/KRW=${rate}`))
    .catch((err) => console.error('[FX_RATE] 시작 시 환율 갱신 실패 (마지막 저장값 사용)', err))

  setInterval(() => {
    const now = new Date()
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    const today = kst.toISOString().slice(0, 10)
    const hour = kst.getUTCHours()
    const minute = kst.getUTCMinutes()
    const key = `${today}-${hour}`

    if (FX_REFRESH_HOURS.includes(hour) && minute === 0 && lastFxRefreshKey !== key) {
      lastFxRefreshKey = key
      refreshUsdKrwRate()
        .then(({ rate }) => console.log(`[FX_RATE] 환율 갱신: USD/KRW=${rate}`))
        .catch((err) => console.error('[FX_RATE] 환율 갱신 실패 (마지막 저장값 사용)', err))
    }
  }, 60_000)

  console.log('환율 갱신 스케줄러 시작: 매일 09:00/15:00/21:00 KST')
})
