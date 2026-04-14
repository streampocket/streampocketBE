import type { ExpenseCategory, ExpensePayer } from '@prisma/client'
import { findExpensesByDateRange } from '../repositories/expenseRepository'
import { sendDiscordAlert } from '../lib/discord'

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

export async function sendDailyExpenseSummary(): Promise<void> {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const todayStr = kst.toISOString().slice(0, 10)

  // KST 기준 당일 00:00:00 ~ 23:59:59.999
  const startOfDay = new Date(`${todayStr}T00:00:00.000+09:00`)
  const endOfDay = new Date(`${todayStr}T23:59:59.999+09:00`)

  const expenses = await findExpensesByDateRange(startOfDay, endOfDay)

  const lines: string[] = []
  lines.push(`📊 **일일 비용 요약 (${todayStr})**`)
  lines.push('━━━━━━━━━━━━━━━━━━━━')

  if (expenses.length === 0) {
    lines.push('\n오늘 등록된 비용이 없습니다.')
    await sendDiscordAlert('expense', lines.join('\n'))
    return
  }

  const grouped = new Map<ExpenseCategory, typeof expenses>()
  for (const expense of expenses) {
    const list = grouped.get(expense.category) ?? []
    list.push(expense)
    grouped.set(expense.category, list)
  }

  for (const [category, items] of grouped) {
    const icon = CATEGORY_ICONS[category]
    const label = CATEGORY_LABELS[category]
    lines.push(`\n${icon} **${label}** (${items.length}건)`)

    for (const item of items) {
      const payerLabel = PAYER_LABELS[item.payer]
      const memo = item.memo ? ` | ${item.memo}` : ''
      lines.push(
        `  - ${item.amount.toLocaleString('ko-KR')}원 (${payerLabel})${memo}`,
      )
    }
  }

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)
  const songTotal = expenses
    .filter((e) => e.payer === 'song_donggeon')
    .reduce((sum, e) => sum + e.amount, 0)
  const imTotal = expenses
    .filter((e) => e.payer === 'im_jeongbin')
    .reduce((sum, e) => sum + e.amount, 0)
  const settlement = Math.round((songTotal - imTotal) / 2)

  lines.push(`\n💰 **총합:** ${totalAmount.toLocaleString('ko-KR')}원`)
  lines.push(`  송동건 결제: ${songTotal.toLocaleString('ko-KR')}원`)
  lines.push(`  임정빈 결제: ${imTotal.toLocaleString('ko-KR')}원`)

  if (settlement > 0) {
    lines.push(`\n💸 **정산:** 임정빈 → 송동건 ${settlement.toLocaleString('ko-KR')}원`)
  } else if (settlement < 0) {
    lines.push(`\n💸 **정산:** 송동건 → 임정빈 ${Math.abs(settlement).toLocaleString('ko-KR')}원`)
  } else {
    lines.push(`\n💸 **정산:** 없음 (동일 금액)`)
  }

  await sendDiscordAlert('expense', lines.join('\n'))
}
