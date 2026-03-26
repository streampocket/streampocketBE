import 'dotenv/config'
import { app } from './app'
import { runOrderPolling } from './services/steamFulfillmentService'
import { naverOrderSource } from './services/platform/naverOrderSource'

const PORT = Number(process.env.PORT ?? 4000)
const POLL_INTERVAL_MS = Number(process.env['ORDER_POLL_INTERVAL_SECONDS'] ?? 300) * 1000

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`)
  console.log(`Swagger: http://localhost:${PORT}/api/docs`)

  runOrderPolling(naverOrderSource, 'startup').catch(console.error)

  setInterval(() => {
    runOrderPolling(naverOrderSource, 'interval').catch(console.error)
  }, POLL_INTERVAL_MS)

  console.log(`주문 폴링 시작: ${POLL_INTERVAL_MS / 1000}초 간격`)
})
