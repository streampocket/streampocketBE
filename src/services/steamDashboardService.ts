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
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { start: periodStart, end: periodEnd } = getPeriodRange(period)

  const [
    todayOrderCount,
    pendingCount,
    manualReviewCount,
    failedCount,
    stockByProduct,
  ] = await Promise.all([
    prisma.steamOrderItem.count({
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.steamOrderItem.count({ where: { fulfillmentStatus: 'pending' } }),
    prisma.steamOrderItem.count({ where: { fulfillmentStatus: 'manual_review' } }),
    prisma.steamOrderItem.count({ where: { fulfillmentStatus: 'failed' } }),
    prisma.steamProduct.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            accounts: { where: { status: 'available' } },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
  ])

  const revenue = await getRevenueSummary(periodStart, periodEnd)

  return {
    today: {
      orderCount: todayOrderCount,
    },
    orders: {
      pending: pendingCount,
      manualReview: manualReviewCount,
      failed: failedCount,
    },
    stock: stockByProduct.map((p) => ({
      productId: p.id,
      productName: p.name,
      availableCodes: p._count.accounts,
    })),
    revenue,
  }
}
