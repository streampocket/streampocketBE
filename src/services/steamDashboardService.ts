import { prisma } from '../lib/prisma'
import { sumExpensesByCategory } from '../repositories/expenseRepository'
import { sumManualRevenue } from '../repositories/manualRevenueRepository'

type Period = 'today' | 'week' | 'month' | 'all'

function getPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date()

  switch (period) {
    case 'today': {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      return { start, end: now }
    }
    case 'week': {
      const start = new Date(now)
      const day = start.getDay()
      const diff = day === 0 ? 6 : day - 1
      start.setDate(start.getDate() - diff)
      start.setHours(0, 0, 0, 0)
      return { start, end: now }
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start, end: now }
    }
    case 'all': {
      const start = new Date(0)
      return { start, end: now }
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
  const [decidedAggregate, pendingAggregate, alimtalkCount, expenseSums, manualRevenueTotal] =
    await Promise.all([
      prisma.steamOrderItem.aggregate({
        where: {
          fulfillmentStatus: 'completed',
          decisionDate: { not: null, gte: startDate, lte: endDate },
        },
        _sum: { unitPrice: true, settlementAmount: true },
      }),
      prisma.steamOrderItem.aggregate({
        where: {
          fulfillmentStatus: 'completed',
          decisionDate: null,
          paidAt: { gte: startDate, lte: endDate },
        },
        _sum: { unitPrice: true },
      }),
      prisma.deliveryLog.count({
        where: {
          status: 'sent',
          sentAt: { gte: startDate, lte: endDate },
        },
      }),
      sumExpensesByCategory(startDate, endDate),
      sumManualRevenue(startDate, endDate),
    ])

  const naverRevenue = decidedAggregate._sum.unitPrice ?? 0
  const naverSettlement = decidedAggregate._sum.settlementAmount ?? 0
  const naverCommission = naverRevenue - naverSettlement
  const pendingSettlement = pendingAggregate._sum.unitPrice ?? 0

  const totalRevenue = naverRevenue + manualRevenueTotal
  const totalSettlement = naverSettlement + manualRevenueTotal

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
    prisma.steamOrderItem.count(),
    prisma.steamOrderItem.count({
      where: { decisionDate: { not: null } },
    }),
    prisma.steamOrderItem.count({
      where: { fulfillmentStatus: 'completed', decisionDate: null },
    }),
    prisma.steamOrderItem.count({
      where: { fulfillmentStatus: 'returned' },
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
    Array<{ date: Date; total_revenue: bigint; total_settlement: bigint }>
  >`
    SELECT
      DATE_TRUNC('day', decision_date) AS date,
      COALESCE(SUM(unit_price), 0) AS total_revenue,
      COALESCE(SUM(settlement_amount), 0) AS total_settlement
    FROM steam_order_items
    WHERE fulfillment_status = 'completed'
      AND decision_date IS NOT NULL
      AND decision_date >= ${startDate}
    GROUP BY DATE_TRUNC('day', decision_date)
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

  const revenueMap = new Map<string, { totalRevenue: number; totalSettlement: number }>()
  for (const row of revenueByDay) {
    const key = new Date(row.date).toISOString().slice(0, 10)
    revenueMap.set(key, {
      totalRevenue: Number(row.total_revenue),
      totalSettlement: Number(row.total_settlement),
    })
  }

  const result: Array<{ date: string; totalRevenue: number; netProfit: number }> = []
  const current = new Date(startDate)
  const now = new Date()

  while (current <= now) {
    const key = current.toISOString().slice(0, 10)
    const rev = revenueMap.get(key)
    const expense = expenseMap.get(key) ?? 0
    result.push({
      date: key,
      totalRevenue: rev?.totalRevenue ?? 0,
      netProfit: (rev?.totalSettlement ?? 0) - expense,
    })
    current.setDate(current.getDate() + 1)
  }

  return result
}

export async function getProductRanking() {
  const rankings = await prisma.steamOrderItem.groupBy({
    by: ['productName'],
    where: {
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
    WHERE decision_date IS NOT NULL
      AND paid_at IS NOT NULL
  `

  const avgDays = result[0]?.avg_days
  return avgDays !== null && avgDays !== undefined
    ? Math.round(avgDays * 10) / 10
    : 0
}
