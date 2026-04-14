import type { ExpenseCategory } from '@prisma/client'
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
      const perPerson = Math.round(item.amount / 2)
      const memo = item.memo ? ` | ${item.memo}` : ''
      lines.push(
        `  - ${item.amount.toLocaleString('ko-KR')}원 (인당 ${perPerson.toLocaleString('ko-KR')}원)${memo}`,
      )
    }
  }

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalPerPerson = Math.round(totalAmount / 2)
  lines.push(
    `\n💰 **총합:** ${totalAmount.toLocaleString('ko-KR')}원 (인당 ${totalPerPerson.toLocaleString('ko-KR')}원)`,
  )

  await sendDiscordAlert('expense', lines.join('\n'))
}
