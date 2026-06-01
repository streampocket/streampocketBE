import { prisma } from '../lib/prisma'
import { NAVER_FEE_RATE } from '../constants/fees'
import { sumExpensesByCategory } from '../repositories/expenseRepository'
import { sumManualRevenue } from '../repositories/manualRevenueRepository'

type Period = 'today' | 'week' | 'month' | 'all'

// KST 자정(00:00:00.000+09:00) Date 생성 — y/m/d는 KST 벽시계 기준
function kstMidnight(year: number, month: number, day: number): Date {
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return new Date(`${year}-${mm}-${dd}T00:00:00.000+09:00`)
}

// 기간 시작 경계를 KST 기준으로 산출 (서버 타임존 무관). 끝은 현재 시각.
function getPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date()
  // KST 벽시계 필드를 얻기 위해 +9h 시프트 후 getUTC* 사용
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const year = kstNow.getUTCFullYear()
  const month = kstNow.getUTCMonth() + 1
  const day = kstNow.getUTCDate()

  switch (period) {
    case 'today': {
      return { start: kstMidnight(year, month, day), end: now }
    }
    case 'week': {
      // KST 기준 이번주 월요일 00:00
      const weekday = kstNow.getUTCDay() // 0=일 ~ 6=토
      const diff = weekday === 0 ? 6 : weekday - 1
      const todayMidnight = kstMidnight(year, month, day)
      const start = new Date(todayMidnight.getTime() - diff * 24 * 60 * 60 * 1000)
      return { start, end: now }
    }
    case 'month': {
      return { start: kstMidnight(year, month, 1), end: now }
    }
    case 'all': {
      return { start: new Date(0), end: now }
    }
  }
}

type RevenueSummary = {
  totalRevenue: number
  totalSettlement: number
  costs: {
    naverCommission: number
    gamePurchase: number
    countryChange: number
    reviewGame: number
    other: number
  }
  totalCosts: number
  netProfit: number
  pendingSettlement: number
  alimtalkCount: number
}

export async function getRevenueSummary(startDate: Date, endDate: Date): Promise<RevenueSummary> {
  const [naverTotals, manualOrderTotals, alimtalkCount, expenseSums, manualRevenueTotal] =
    await Promise.all([
      // 네이버 가능매출 — 결제일(paid_at) 기준, 반품 제외. 구매확정 여부와 무관하게 결제된 전부.
      // pending = 그중 아직 구매확정 안 된 건의 결제금액(구매확정 대기 금액).
      // 일일리포트 sumPaymentAmountPaidOn과 동일 공식(SUM(payment_amount), returned_at IS NULL)
      prisma.$queryRaw<{ revenue: bigint; pending: bigint }[]>`
        SELECT
          COALESCE(SUM(payment_amount), 0)::bigint AS revenue,
          COALESCE(SUM(
            CASE WHEN fulfillment_status <> 'purchase_decided'
                 THEN payment_amount ELSE 0 END
          ), 0)::bigint AS pending
        FROM steam_order_items
        WHERE source = 'naver'
          AND returned_at IS NULL
          AND paid_at >= ${startDate}
          AND paid_at <= ${endDate}
      `,
      // 수동 주문 순수익 합산 — 반품 제외, paid_at 기준 (settlement_amount = 입력한 순수익)
      prisma.$queryRaw<{ profit: bigint }[]>`
        SELECT COALESCE(SUM(settlement_amount), 0)::bigint AS profit
        FROM steam_order_items
        WHERE source = 'manual'
          AND fulfillment_status <> 'returned'
          AND paid_at >= ${startDate}
          AND paid_at <= ${endDate}
      `,
      prisma.deliveryLog.count({
        where: {
          status: 'sent',
          sentAt: { gte: startDate, lte: endDate },
        },
      }),
      sumExpensesByCategory(startDate, endDate),
      sumManualRevenue(startDate, endDate),
    ])

  const naverRevenue = Number(naverTotals[0]?.revenue ?? 0n)
  const pendingSettlement = Number(naverTotals[0]?.pending ?? 0n)
  const manualOrderProfit = Number(manualOrderTotals[0]?.profit ?? 0n)

  // 네이버 수수료/정산금은 6.63% 고정으로 재계산 (실제 정산금은 구매확정 후에야 채워지므로)
  const naverCommission = Math.round(naverRevenue * NAVER_FEE_RATE)
  const naverSettlement = naverRevenue - naverCommission

  // 수동 주문/수동 매출은 수수료 없이 입력 순수익을 판매금=정산금=순수익으로 가산
  const totalRevenue = naverRevenue + manualRevenueTotal + manualOrderProfit
  const totalSettlement = naverSettlement + manualRevenueTotal + manualOrderProfit

  const manualCosts =
    expenseSums.gamePurchase + expenseSums.countryChange + expenseSums.reviewGame + expenseSums.other
  const totalCosts = naverCommission + manualCosts
  const netProfit = totalSettlement - manualCosts

  return {
    totalRevenue,
    totalSettlement,
    costs: {
      naverCommission,
      ...expenseSums,
    },
    totalCosts,
    netProfit,
    pendingSettlement,
    alimtalkCount,
  }
}

export async function getDashboardStats(period: Period = 'today') {
  const { start: periodStart, end: periodEnd } = getPeriodRange(period)

  const [
    totalOrderCount,
    confirmedCount,
    pendingDecisionCount,
    returnedCount,
  ] = await Promise.all([
    prisma.steamOrderItem.count({ where: { source: 'naver' } }),
    prisma.steamOrderItem.count({
      where: { source: 'naver', decisionDate: { not: null } },
    }),
    prisma.steamOrderItem.count({
      where: {
        source: 'naver',
        fulfillmentStatus: { in: ['pending', 'in_progress', 'completed'] },
        decisionDate: null,
      },
    }),
    prisma.steamOrderItem.count({
      where: { source: 'naver', fulfillmentStatus: 'returned' },
    }),
  ])

  const revenue = await getRevenueSummary(periodStart, periodEnd)

  return {
    cards: {
      totalOrders: totalOrderCount,
      confirmedOrders: confirmedCount,
      pendingDecisionOrders: pendingDecisionCount,
      returnedOrders: returnedCount,
    },
    revenue,
  }
}

export async function getRevenueChart(days: number) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  const revenueByDay = await prisma.$queryRaw<
    Array<{ date: Date; total_revenue: bigint }>
  >`
    SELECT
      DATE_TRUNC('day', paid_at) AS date,
      COALESCE(SUM(payment_amount), 0) AS total_revenue
    FROM steam_order_items
    WHERE source = 'naver'
      AND returned_at IS NULL
      AND paid_at >= ${startDate}
    GROUP BY DATE_TRUNC('day', paid_at)
    ORDER BY date
  `

  const expenseByDay = await prisma.$queryRaw<
    Array<{ date: Date; total_expense: bigint }>
  >`
    SELECT
      DATE_TRUNC('day', date) AS date,
      COALESCE(SUM(amount), 0) AS total_expense
    FROM expenses
    WHERE date >= ${startDate}
    GROUP BY DATE_TRUNC('day', date)
  `

  const expenseMap = new Map<string, number>()
  for (const row of expenseByDay) {
    const key = new Date(row.date).toISOString().slice(0, 10)
    expenseMap.set(key, Number(row.total_expense))
  }

  const revenueMap = new Map<string, number>()
  for (const row of revenueByDay) {
    const key = new Date(row.date).toISOString().slice(0, 10)
    revenueMap.set(key, Number(row.total_revenue))
  }

  const result: Array<{ date: string; totalRevenue: number; netProfit: number }> = []
  const current = new Date(startDate)
  const now = new Date()

  while (current <= now) {
    const key = current.toISOString().slice(0, 10)
    const dayRevenue = revenueMap.get(key) ?? 0
    const expense = expenseMap.get(key) ?? 0
    // 정산금 = 가능매출 - 6.63% 수수료 → 순이익 = 정산금 - 비용
    const daySettlement = dayRevenue - Math.round(dayRevenue * NAVER_FEE_RATE)
    result.push({
      date: key,
      totalRevenue: dayRevenue,
      netProfit: daySettlement - expense,
    })
    current.setDate(current.getDate() + 1)
  }

  return result
}

export async function getProductRanking() {
  const rankings = await prisma.steamOrderItem.groupBy({
    by: ['productName'],
    where: {
      source: 'naver',
      fulfillmentStatus: { not: 'returned' },
    },
    _count: { id: true },
    _sum: { unitPrice: true },
    orderBy: { _sum: { unitPrice: 'desc' } },
    take: 5,
  })

  return rankings.map((r) => ({
    productName: r.productName,
    orderCount: r._count.id,
    totalRevenue: r._sum.unitPrice ?? 0,
  }))
}

export async function getAverageDecisionDays() {
  const result = await prisma.$queryRaw<Array<{ avg_days: number | null }>>`
    SELECT AVG(
      EXTRACT(EPOCH FROM (decision_date - paid_at)) / 86400.0
    ) AS avg_days
    FROM steam_order_items
    WHERE source = 'naver'
      AND decision_date IS NOT NULL
      AND paid_at IS NOT NULL
  `

  const avgDays = result[0]?.avg_days
  return avgDays !== null && avgDays !== undefined
    ? Math.round(avgDays * 10) / 10
    : 0
}
