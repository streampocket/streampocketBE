import type { ExpenseCategory, ExpensePayer } from '@prisma/client'
import { NAVER_FEE_RATE } from '../constants/fees'
import { sendDiscordAlert } from '../lib/discord'
import {
  countOrdersDecidedOn,
  countOrdersPaidOn,
  countOrdersReturnedOn,
  sumPaymentAmountPaidOn,
} from '../repositories/dailySalesRepository'
import { findExpensesByDateRange } from '../repositories/expenseRepository'
import { findMemoByDate } from '../repositories/dailyMemoRepository'
import { sumManualRevenue } from '../repositories/manualRevenueRepository'
import {
  listGcoinOrdersPaidOn,
  listManualOrdersPaidOn,
  listPartyOrdersPaidOn,
} from '../repositories/steamOrderRepository'

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

type DailyReportOrderLine = {
  productName: string
  settlementAmount: number | null
}

type DailyReportExpense = {
  category: ExpenseCategory
  payer: ExpensePayer
  amount: number
  memo: string | null
}

// 송금 방향: 양수 기준액 = 임정빈 → 송동건 (im_to_song), 0 = 동일 부담(none)
type DailySettlementTransfer = {
  direction: 'im_to_song' | 'song_to_im' | 'none'
  amount: number
}

export type DailyReport = {
  date: string
  orderCount: number
  decidedCount: number
  returnedCount: number
  naverRevenue: number
  naverFee: number
  naverSettlement: number
  manualOrders: DailyReportOrderLine[]
  partyOrders: DailyReportOrderLine[]
  gcoinOrders: DailyReportOrderLine[]
  manualTotal: number
  partyTotal: number
  gcoinTotal: number
  manualRevenueTotal: number
  expenses: DailyReportExpense[]
  expenseTotal: number
  songTotal: number
  imTotal: number
  netProfit: number
  settlement: {
    includingManual: DailySettlementTransfer
    excludingManual: DailySettlementTransfer
  } | null
  memo: string | null
}

// 송금 기준액(부호 있음) → 방향/금액. 양수면 송동건이 더 부담 → 임정빈이 송금.
function toTransfer(base: number): DailySettlementTransfer {
  const amount = Math.round(Math.abs(base) / 2)
  if (amount === 0) return { direction: 'none', amount: 0 }
  return { direction: base > 0 ? 'im_to_song' : 'song_to_im', amount }
}

// 일일 종합 리포트 데이터 생성 — 디스코드 발송과 대시보드 캘린더 모달이 공유하는 단일 소스.
// 순수익 공식은 대시보드(getRevenueSummary)와 동일:
//   네이버 정산금(매출×(1−6.63%)) + 수동매출 + 수동/파티/배그 주문 순수익 − 비용
export async function buildDailyReport(dateStr: string): Promise<DailyReport> {
  // KST 기준 당일 00:00:00 ~ 23:59:59.999
  const startOfDay = new Date(`${dateStr}T00:00:00.000+09:00`)
  const endOfDay = new Date(`${dateStr}T23:59:59.999+09:00`)

  const [
    orderCount,
    decidedCount,
    returnedCount,
    naverRevenue,
    expenses,
    manualOrders,
    partyOrders,
    gcoinOrders,
    manualRevenueTotal,
    memoRow,
  ] = await Promise.all([
    countOrdersPaidOn(startOfDay, endOfDay),
    countOrdersDecidedOn(startOfDay, endOfDay),
    countOrdersReturnedOn(startOfDay, endOfDay),
    sumPaymentAmountPaidOn(startOfDay, endOfDay),
    findExpensesByDateRange(startOfDay, endOfDay),
    listManualOrdersPaidOn(startOfDay, endOfDay),
    listPartyOrdersPaidOn(startOfDay, endOfDay),
    listGcoinOrdersPaidOn(startOfDay, endOfDay),
    sumManualRevenue(startOfDay, endOfDay),
    findMemoByDate(dateStr),
  ])

  const naverFee = Math.round(naverRevenue * NAVER_FEE_RATE)
  const naverSettlement = naverRevenue - naverFee
  const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0)

  const manualTotal = manualOrders.reduce((sum, o) => sum + (o.settlementAmount ?? 0), 0)
  const partyTotal = partyOrders.reduce((sum, o) => sum + (o.settlementAmount ?? 0), 0)
  const gcoinTotal = gcoinOrders.reduce((sum, o) => sum + (o.settlementAmount ?? 0), 0)

  const netProfit =
    naverSettlement + manualRevenueTotal + manualTotal + partyTotal + gcoinTotal - expenseTotal

  const songTotal = expenses
    .filter((e) => e.payer === 'song_donggeon')
    .reduce((sum, e) => sum + e.amount, 0)
  const imTotal = expenses
    .filter((e) => e.payer === 'im_jeongbin')
    .reduce((sum, e) => sum + e.amount, 0)

  // 수동매출·파티매출·배그매출은 송동건이 수령하므로 송동건 부담에서 차감한다.
  const hasSettlement =
    expenses.length > 0 || manualTotal > 0 || partyTotal > 0 || gcoinTotal > 0
  const settlement = hasSettlement
    ? {
        includingManual: toTransfer(songTotal - imTotal - manualTotal - partyTotal - gcoinTotal),
        excludingManual: toTransfer(songTotal - imTotal),
      }
    : null

  return {
    date: dateStr,
    orderCount,
    decidedCount,
    returnedCount,
    naverRevenue,
    naverFee,
    naverSettlement,
    manualOrders,
    partyOrders,
    gcoinOrders,
    manualTotal,
    partyTotal,
    gcoinTotal,
    manualRevenueTotal,
    expenses: expenses.map((e) => ({
      category: e.category,
      payer: e.payer,
      amount: e.amount,
      memo: e.memo,
    })),
    expenseTotal,
    songTotal,
    imTotal,
    netProfit,
    settlement,
    memo: memoRow?.content ?? null,
  }
}

export async function sendDailySalesReport(): Promise<void> {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const todayStr = kst.toISOString().slice(0, 10)

  const report = await buildDailyReport(todayStr)

  const lines: string[] = []
  lines.push(`📊 **일일 종합 리포트 (${report.date})**`)
  lines.push('━━━━━━━━━━━━━━━━━━━━')
  lines.push(`📦 오늘 주문: ${report.orderCount}건`)
  lines.push(`✅ 구매확정: ${report.decidedCount}건`)
  lines.push(`🔄 반품건수: ${report.returnedCount}건`)
  lines.push('')
  lines.push(`💰 네이버 매출: ${fmt(report.naverRevenue)}원`)
  lines.push(`🏦 네이버 수수료(6.63%): ${fmt(report.naverFee)}원`)

  if (report.manualOrders.length > 0) {
    lines.push('')
    lines.push(`✋ **수동 주문** (${report.manualOrders.length}건)`)
    for (const order of report.manualOrders) {
      lines.push(`  · ${order.productName} | ${fmt(order.settlementAmount ?? 0)}원`)
    }
    lines.push(`  소계: ${fmt(report.manualTotal)}원`)
  }

  if (report.partyOrders.length > 0) {
    lines.push('')
    lines.push(`🎉 **파티 주문** (${report.partyOrders.length}건)`)
    for (const order of report.partyOrders) {
      lines.push(`  · ${order.productName} | ${fmt(order.settlementAmount ?? 0)}원`)
    }
    lines.push(`  소계: ${fmt(report.partyTotal)}원`)
  }

  if (report.gcoinOrders.length > 0) {
    lines.push('')
    lines.push(`🪙 **배그 주문** (${report.gcoinOrders.length}건)`)
    for (const order of report.gcoinOrders) {
      lines.push(`  · ${order.productName} | ${fmt(order.settlementAmount ?? 0)}원`)
    }
    lines.push(`  소계: ${fmt(report.gcoinTotal)}원`)
  }

  if (report.expenses.length > 0) {
    lines.push('')
    lines.push(`💸 **비용** (${report.expenses.length}건)`)

    const grouped = new Map<ExpenseCategory, DailyReport['expenses']>()
    for (const expense of report.expenses) {
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
    lines.push(`  총합: ${fmt(report.expenseTotal)}원`)
    lines.push(`    송동건 결제 ${fmt(report.songTotal)}원`)
    lines.push(`    임정빈 결제 ${fmt(report.imTotal)}원`)
  }

  // 순수익 — 대시보드와 동일 공식. 0원인 항은 생략해 계산식을 짧게 유지
  const orderProfitTotal = report.manualTotal + report.partyTotal + report.gcoinTotal
  const terms: string[] = [`네이버 정산금 ${fmt(report.naverSettlement)}`]
  if (report.manualRevenueTotal > 0) terms.push(`수동매출 ${fmt(report.manualRevenueTotal)}`)
  if (orderProfitTotal > 0) terms.push(`수동/파티/배그 ${fmt(orderProfitTotal)}`)
  const expensePart = report.expenseTotal > 0 ? ` − 비용 ${fmt(report.expenseTotal)}` : ''

  lines.push('')
  lines.push(`✨ **순수익:** ${terms.join(' + ')}${expensePart} = ${fmt(report.netProfit)}원`)

  if (report.settlement) {
    const settlementLine = (transfer: { direction: string; amount: number }): string => {
      if (transfer.direction === 'none') return '없음 (동일 부담)'
      return transfer.direction === 'im_to_song'
        ? `임정빈 → 송동건 ${fmt(transfer.amount)}원`
        : `송동건 → 임정빈 ${fmt(transfer.amount)}원`
    }

    lines.push('')
    lines.push(`💸 **분담 정산**`)
    lines.push(`  수동+파티+배그 매출 반영: ${settlementLine(report.settlement.includingManual)}`)
    lines.push(`  수동+파티+배그 매출 미반영: ${settlementLine(report.settlement.excludingManual)}`)
  }

  await sendDiscordAlert('expense', lines.join('\n'))
}
