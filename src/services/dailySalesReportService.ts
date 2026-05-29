import type { ExpenseCategory, ExpensePayer } from '@prisma/client'
import { sendDiscordAlert } from '../lib/discord'
import {
  countOrdersDecidedOn,
  countOrdersPaidOn,
  countOrdersReturnedOn,
  sumPaymentAmountPaidOn,
} from '../repositories/dailySalesRepository'
import { findExpensesByDateRange } from '../repositories/expenseRepository'
import { listManualOrdersPaidOn } from '../repositories/steamOrderRepository'

const NAVER_FEE_RATE = 0.066

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  game_purchase: '게임 구매비',
  country_change: '국가변경',
  review_game: '리뷰 게임',
  other: '기타',
}

const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  game_purchase: '🎮',
  country_change: '🌍',
  review_game: '📝',
  other: '📦',
}

const PAYER_LABELS: Record<ExpensePayer, string> = {
  song_donggeon: '송동건',
  im_jeongbin: '임정빈',
}

const fmt = (n: number): string => n.toLocaleString('ko-KR')

export async function sendDailySalesReport(): Promise<void> {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const todayStr = kst.toISOString().slice(0, 10)

  // KST 기준 당일 00:00:00 ~ 23:59:59.999
  const startOfDay = new Date(`${todayStr}T00:00:00.000+09:00`)
  const endOfDay = new Date(`${todayStr}T23:59:59.999+09:00`)

  const [
    orderCount,
    decidedCount,
    returnedCount,
    naverRevenue,
    expenses,
    manualOrders,
  ] = await Promise.all([
    countOrdersPaidOn(startOfDay, endOfDay),
    countOrdersDecidedOn(startOfDay, endOfDay),
    countOrdersReturnedOn(startOfDay, endOfDay),
    sumPaymentAmountPaidOn(startOfDay, endOfDay),
    findExpensesByDateRange(startOfDay, endOfDay),
    listManualOrdersPaidOn(startOfDay, endOfDay),
  ])

  const naverFee = Math.round(naverRevenue * NAVER_FEE_RATE)
  const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0)
  const netProfit = naverRevenue - naverFee - expenseTotal

  const manualTotal = manualOrders.reduce((sum, o) => sum + (o.settlementAmount ?? 0), 0)

  const songTotal = expenses
    .filter((e) => e.payer === 'song_donggeon')
    .reduce((sum, e) => sum + e.amount, 0)
  const imTotal = expenses
    .filter((e) => e.payer === 'im_jeongbin')
    .reduce((sum, e) => sum + e.amount, 0)

  const lines: string[] = []
  lines.push(`📊 **일일 종합 리포트 (${todayStr})**`)
  lines.push('━━━━━━━━━━━━━━━━━━━━')
  lines.push(`📦 오늘 주문: ${orderCount}건`)
  lines.push(`✅ 구매확정: ${decidedCount}건`)
  lines.push(`🔄 반품건수: ${returnedCount}건`)
  lines.push('')
  lines.push(`💰 네이버 매출: ${fmt(naverRevenue)}원`)
  lines.push(`🏦 네이버 수수료(6.6%): ${fmt(naverFee)}원`)

  if (manualOrders.length > 0) {
    lines.push('')
    lines.push(`✋ **수동 주문** (${manualOrders.length}건)`)
    for (const order of manualOrders) {
      lines.push(`  · ${order.productName} | ${fmt(order.settlementAmount ?? 0)}원`)
    }
    lines.push(`  소계: ${fmt(manualTotal)}원`)
  }

  if (expenses.length > 0) {
    lines.push('')
    lines.push(`💸 **비용** (${expenses.length}건)`)

    const grouped = new Map<ExpenseCategory, typeof expenses>()
    for (const expense of expenses) {
      const list = grouped.get(expense.category) ?? []
      list.push(expense)
      grouped.set(expense.category, list)
    }

    for (const [category, items] of grouped) {
      lines.push(`  ${CATEGORY_ICONS[category]} ${CATEGORY_LABELS[category]}`)
      for (const item of items) {
        const memo = item.memo ? ` | ${item.memo}` : ''
        lines.push(`   · ${fmt(item.amount)}원 (${PAYER_LABELS[item.payer]})${memo}`)
      }
    }
    lines.push(`  총합: ${fmt(expenseTotal)}원`)
    lines.push(`    송동건 결제 ${fmt(songTotal)}원`)
    lines.push(`    임정빈 결제 ${fmt(imTotal)}원`)
  }

  lines.push('')
  lines.push(
    `✨ **순수익:** ${fmt(naverRevenue)} − ${fmt(naverFee)} − ${fmt(expenseTotal)} = ${fmt(netProfit)}원`,
  )

  if (expenses.length > 0 || manualTotal > 0) {
    // 송금 기준액(부호 있음). 양수면 송동건이 더 부담 → 임정빈이 송금.
    // 수동매출은 송동건이 수령하므로 송동건 부담에서 차감한다.
    const baseIncludingManual = songTotal - imTotal - manualTotal
    const baseExcludingManual = songTotal - imTotal

    const settlementLine = (base: number): string => {
      const amount = Math.round(Math.abs(base) / 2)
      if (amount === 0) return '없음 (동일 부담)'
      return base > 0
        ? `임정빈 → 송동건 ${fmt(amount)}원`
        : `송동건 → 임정빈 ${fmt(amount)}원`
    }

    lines.push('')
    lines.push(`💸 **분담 정산**`)
    lines.push(`  수동매출 반영: ${settlementLine(baseIncludingManual)}`)
    lines.push(`  수동매출 미반영: ${settlementLine(baseExcludingManual)}`)
  }

  await sendDiscordAlert('expense', lines.join('\n'))
}
