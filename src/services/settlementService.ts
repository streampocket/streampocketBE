import { getRevenueSummary } from './steamDashboardService'
import { sendDiscordAlert } from '../lib/discord'

function getWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  const day = now.getDay()

  // 이번 주 금요일 23:59:59 (end)
  const friday = new Date(now)
  const daysUntilFriday = (5 - day + 7) % 7
  friday.setDate(now.getDate() + (daysUntilFriday === 0 && now.getHours() >= 23 ? 0 : daysUntilFriday === 0 ? 0 : daysUntilFriday))
  friday.setHours(23, 59, 59, 999)

  // 해당 주 토요일 00:00 (start) = 금요일 - 6일
  const saturday = new Date(friday)
  saturday.setDate(friday.getDate() - 6)
  saturday.setHours(0, 0, 0, 0)

  return { start: saturday, end: friday }
}

function formatDate(date: Date): string {
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

function formatAmount(n: number): string {
  return n.toLocaleString('ko-KR')
}

export async function generateWeeklySettlement(): Promise<void> {
  const { start, end } = getWeekRange()
  const summary = await getRevenueSummary(start, end)

  const perPerson = Math.round(summary.netProfit / 2)

  const message = [
    `📊 **주간 정산 (${formatDate(start)} ~ ${formatDate(end)})**`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `매출: ${formatAmount(summary.totalRevenue)}원`,
    `비용: ${formatAmount(summary.totalCosts)}원`,
    `  - 네이버 수수료: ${formatAmount(summary.costs.naverCommission)}원`,
    `  - 알림톡: ${formatAmount(summary.costs.alimtalk)}원`,
    `  - 게임 구매비: ${formatAmount(summary.costs.gamePurchase)}원`,
    `  - 국가변경: ${formatAmount(summary.costs.countryChange)}원`,
    `  - 리뷰 게임: ${formatAmount(summary.costs.reviewGame)}원`,
    `  - 기타: ${formatAmount(summary.costs.other)}원`,
    `순수익: ${formatAmount(summary.netProfit)}원`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `**인당 수익: ${formatAmount(perPerson)}원**`,
  ].join('\n')

  await sendDiscordAlert('settlement', message)
}
