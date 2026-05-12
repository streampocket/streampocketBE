import { sendDiscordAlert } from '../lib/discord'
import {
  countOrdersDecidedOn,
  countOrdersPaidOn,
  countOrdersReturnedOn,
  sumPaymentAmountPaidOn,
} from '../repositories/dailySalesRepository'
import { sumExpensesByCategory } from '../repositories/expenseRepository'

const NAVER_FEE_RATE = 0.066

export async function sendDailySalesReport(): Promise<void> {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const todayStr = kst.toISOString().slice(0, 10)

  // KST 기준 당일 00:00:00 ~ 23:59:59.999
  const startOfDay = new Date(`${todayStr}T00:00:00.000+09:00`)
  const endOfDay = new Date(`${todayStr}T23:59:59.999+09:00`)

  const [orderCount, decidedCount, returnedCount, totalRevenue, expenseSums] = await Promise.all([
    countOrdersPaidOn(startOfDay, endOfDay),
    countOrdersDecidedOn(startOfDay, endOfDay),
    countOrdersReturnedOn(startOfDay, endOfDay),
    sumPaymentAmountPaidOn(startOfDay, endOfDay),
    sumExpensesByCategory(startOfDay, endOfDay),
  ])

  const totalCost =
    expenseSums.gamePurchase +
    expenseSums.countryChange +
    expenseSums.reviewGame +
    expenseSums.other
  const naverFee = Math.round(totalRevenue * NAVER_FEE_RATE)
  const netProfit = totalRevenue - naverFee - totalCost

  const fmt = (n: number): string => n.toLocaleString('ko-KR')

  const lines: string[] = []
  lines.push(`📊 **일일 매출 리포트 (${todayStr})**`)
  lines.push('━━━━━━━━━━━━━━━━━━━━')
  lines.push(`📦 오늘 주문: ${orderCount}건`)
  lines.push(`✅ 구매확정: ${decidedCount}건`)
  lines.push(`🔄 반품건수: ${returnedCount}건`)
  lines.push('')
  lines.push(`💰 총 매출: ${fmt(totalRevenue)}원`)
  lines.push(`💸 총 비용: ${fmt(totalCost)}원`)
  lines.push(`🏦 네이버 수수료(6.6%): ${fmt(naverFee)}원`)
  lines.push(`✨ 순수익: ${fmt(netProfit)}원`)

  await sendDiscordAlert('settlement', lines.join('\n'))
}
