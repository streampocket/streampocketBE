import { prisma } from '../lib/prisma'
import { findMonthlyAdjustment, findAllMonthlyAdjustments } from '../repositories/settingsRepository'

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

function getCurrentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

async function getAdjustmentsForPeriod(period: Period) {
  const zero = { payment: 0, commission: 0, net: 0 }

  if (period === 'today' || period === 'week') return zero

  if (period === 'month') {
    const adj = await findMonthlyAdjustment(getCurrentYearMonth())
    if (!adj) return zero
    return {
      payment: adj.paymentAdjustment,
      commission: adj.commissionAdjustment,
      net: adj.netRevenueAdjustment,
    }
  }

  // all
  const allAdj = await findAllMonthlyAdjustments()
  return allAdj.reduce(
    (acc, adj) => ({
      payment: acc.payment + adj.paymentAdjustment,
      commission: acc.commission + adj.commissionAdjustment,
      net: acc.net + adj.netRevenueAdjustment,
    }),
    { payment: 0, commission: 0, net: 0 },
  )
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
    revenueAggregate,
    settings,
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
    prisma.steamOrderItem.aggregate({
      where: {
        fulfillmentStatus: 'completed',
        paidAt: { gte: periodStart, lte: periodEnd },
      },
      _sum: { unitPrice: true },
    }),
    prisma.systemSettings.findFirst(),
  ])

  const commissionRate = settings?.commissionRate ? Number(settings.commissionRate) : 0
  const autoPayment = revenueAggregate._sum.unitPrice ?? 0
  const autoCommission = Math.round((autoPayment * commissionRate) / 100)
  const autoNet = autoPayment - autoCommission

  const adj = await getAdjustmentsForPeriod(period)

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
    revenue: {
      auto: { payment: autoPayment, commission: autoCommission, net: autoNet },
      adjustment: { payment: adj.payment, commission: adj.commission, net: adj.net },
      total: {
        payment: autoPayment + adj.payment,
        commission: autoCommission + adj.commission,
        net: autoNet + adj.net,
      },
      commissionRate,
    },
  }
}
