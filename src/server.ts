import 'dotenv/config'
import { app } from './app'
import { runOrderPolling } from './services/steamFulfillmentService'
import { naverOrderSource } from './services/platform/naverOrderSource'
import { generateWeeklySettlement } from './services/settlementService'

const PORT = Number(process.env.PORT ?? 4000)
const POLL_INTERVAL_MS = Number(process.env['ORDER_POLL_INTERVAL_SECONDS'] ?? 300) * 1000

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`)
  console.log(`Swagger: http://localhost:${PORT}/api/docs`)

  // 주문 폴링
  runOrderPolling(naverOrderSource, 'startup').catch(console.error)

  setInterval(() => {
    runOrderPolling(naverOrderSource, 'interval').catch(console.error)
  }, POLL_INTERVAL_MS)

  console.log(`주문 폴링 시작: ${POLL_INTERVAL_MS / 1000}초 간격`)

  // 주간 정산 스케줄러 (매주 금요일 23:59)
  let lastSettlementDate = ''

  setInterval(() => {
    const now = new Date()
    const day = now.getDay()
    const hour = now.getHours()
    const minute = now.getMinutes()
    const today = now.toISOString().slice(0, 10)

    if (day === 5 && hour === 23 && minute === 59 && lastSettlementDate !== today) {
      lastSettlementDate = today
      console.log('[SETTLEMENT] 주간 정산 실행')
      generateWeeklySettlement().catch((err) => {
        console.error('[SETTLEMENT] 주간 정산 실패', err)
      })
    }
  }, 60_000)

  console.log('주간 정산 스케줄러 시작: 매주 금요일 23:59')
})
