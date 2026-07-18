import { Prisma, Store } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { NAVER_FEE_RATE } from '../constants/fees'
import { findMemoDatesInRange } from '../repositories/dailyMemoRepository'
import { sumExpensesByCategory } from '../repositories/expenseRepository'
import { sumManualRevenue } from '../repositories/manualRevenueRepository'

type Period = 'today' | 'week' | 'month' | 'all'

// store 지정 시 `AND store = ?`(공통=null 제외), 미지정 시 빈 조건(전체=공통 포함). raw SQL 용.
function storeSql(store?: Store): Prisma.Sql {
  return store ? Prisma.sql`AND store = ${store}::"Store"` : Prisma.empty
}

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
  partyOrderProfit: number
  gcoinOrderProfit: number
  pendingSettlement: number
  alimtalkCount: number
}

export async function getRevenueSummary(
  startDate: Date,
  endDate: Date,
  store?: Store,
): Promise<RevenueSummary> {
  const [
    naverTotals,
    manualOrderTotals,
    partyOrderTotals,
    gcoinOrderTotals,
    alimtalkCount,
    expenseSums,
    manualRevenueTotal,
  ] = await Promise.all([
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
          ${storeSql(store)}
      `,
      // 수동 주문 순수익 합산 — 반품 제외, paid_at 기준 (settlement_amount = 입력한 순수익)
      prisma.$queryRaw<{ profit: bigint }[]>`
        SELECT COALESCE(SUM(settlement_amount), 0)::bigint AS profit
        FROM steam_order_items
        WHERE source = 'manual'
          AND fulfillment_status <> 'returned'
          AND paid_at >= ${startDate}
          AND paid_at <= ${endDate}
          ${storeSql(store)}
      `,
      // 파티 주문 순수익 합산 — 수동과 동일 공식이나 별도 집계(대시보드에서 파티 순수익 분리 표시)
      prisma.$queryRaw<{ profit: bigint }[]>`
        SELECT COALESCE(SUM(settlement_amount), 0)::bigint AS profit
        FROM steam_order_items
        WHERE source = 'party'
          AND fulfillment_status <> 'returned'
          AND paid_at >= ${startDate}
          AND paid_at <= ${endDate}
          ${storeSql(store)}
      `,
      // 배그(GCOIN) 주문 순수익 합산 — 파티와 동일 공식, 별도 집계(배그 순수익 분리 표시)
      prisma.$queryRaw<{ profit: bigint }[]>`
        SELECT COALESCE(SUM(settlement_amount), 0)::bigint AS profit
        FROM steam_order_items
        WHERE source = 'gcoin'
          AND fulfillment_status <> 'returned'
          AND paid_at >= ${startDate}
          AND paid_at <= ${endDate}
          ${storeSql(store)}
      `,
      prisma.deliveryLog.count({
        where: {
          status: 'sent',
          sentAt: { gte: startDate, lte: endDate },
          ...(store ? { orderItem: { store } } : {}),
        },
      }),
      sumExpensesByCategory(startDate, endDate, store),
      sumManualRevenue(startDate, endDate, store),
    ])

  const naverRevenue = Number(naverTotals[0]?.revenue ?? 0n)
  const pendingSettlement = Number(naverTotals[0]?.pending ?? 0n)
  const manualOrderProfit = Number(manualOrderTotals[0]?.profit ?? 0n)
  const partyOrderProfit = Number(partyOrderTotals[0]?.profit ?? 0n)
  const gcoinOrderProfit = Number(gcoinOrderTotals[0]?.profit ?? 0n)

  // 네이버 수수료/정산금은 6.63% 고정으로 재계산 (실제 정산금은 구매확정 후에야 채워지므로)
  const naverCommission = Math.round(naverRevenue * NAVER_FEE_RATE)
  const naverSettlement = naverRevenue - naverCommission

  // 수동 주문/파티 주문/배그 주문/수동 매출은 수수료 없이 입력 순수익을 판매금=정산금=순수익으로 가산
  const totalRevenue =
    naverRevenue + manualRevenueTotal + manualOrderProfit + partyOrderProfit + gcoinOrderProfit
  const totalSettlement =
    naverSettlement + manualRevenueTotal + manualOrderProfit + partyOrderProfit + gcoinOrderProfit

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
    partyOrderProfit,
    gcoinOrderProfit,
    pendingSettlement,
    alimtalkCount,
  }
}

export async function getDashboardStats(period: Period = 'today', store?: Store) {
  const { start: periodStart, end: periodEnd } = getPeriodRange(period)
  const storeWhere = store ? { store } : {}

  const [
    totalOrderCount,
    confirmedCount,
    pendingDecisionCount,
    returnedCount,
  ] = await Promise.all([
    prisma.steamOrderItem.count({ where: { source: 'naver', ...storeWhere } }),
    prisma.steamOrderItem.count({
      where: { source: 'naver', decisionDate: { not: null }, ...storeWhere },
    }),
    prisma.steamOrderItem.count({
      where: {
        source: 'naver',
        fulfillmentStatus: { in: ['pending', 'in_progress', 'completed'] },
        decisionDate: null,
        ...storeWhere,
      },
    }),
    prisma.steamOrderItem.count({
      where: { source: 'naver', fulfillmentStatus: 'returned', ...storeWhere },
    }),
  ])

  const revenue = await getRevenueSummary(periodStart, periodEnd, store)

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

export type RevenueCalendarItem = {
  date: string
  totalRevenue: number
  netProfit: number
  hasMemo: boolean
}

// 월 캘린더용 일별 매출/순수익 — 계산 공식은 getRevenueSummary와 동일:
//   totalRevenue = 네이버 매출 + 수동매출 + 수동/파티/배그 주문 순수익
//   netProfit    = 네이버 정산금(매출×(1−6.63%)) + 수동매출 + 수동/파티/배그 주문 순수익 − 비용
// 일자 경계는 전부 KST 기준 (paid_at/expenses.date는 timestamptz라 AT TIME ZONE 변환 필수)
export async function getRevenueCalendar(
  yearMonth: string,
  store?: Store,
): Promise<RevenueCalendarItem[]> {
  const [yearStr, monthStr] = yearMonth.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  // Date.UTC(year, month, 0) = 다음 달 0일 = 해당 월 말일 (month는 1부터)
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const lastDayStr = `${yearMonth}-${String(daysInMonth).padStart(2, '0')}`

  const startDate = kstMidnight(year, month, 1)
  const endDate = new Date(`${lastDayStr}T23:59:59.999+09:00`)

  const [naverByDay, orderProfitByDay, manualRevenueByDay, expenseByDay, memoDates] =
    await Promise.all([
      prisma.$queryRaw<Array<{ day: string; total: bigint }>>`
        SELECT
          to_char(paid_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS day,
          COALESCE(SUM(payment_amount), 0)::bigint AS total
        FROM steam_order_items
        WHERE source = 'naver'
          AND returned_at IS NULL
          AND paid_at >= ${startDate}
          AND paid_at <= ${endDate}
          ${storeSql(store)}
        GROUP BY 1
      `,
      // 수동/파티/배그 주문 순수익 — getRevenueSummary와 동일 조건 (반품 제외)
      prisma.$queryRaw<Array<{ day: string; total: bigint }>>`
        SELECT
          to_char(paid_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS day,
          COALESCE(SUM(settlement_amount), 0)::bigint AS total
        FROM steam_order_items
        WHERE source IN ('manual', 'party', 'gcoin')
          AND fulfillment_status <> 'returned'
          AND paid_at >= ${startDate}
          AND paid_at <= ${endDate}
          ${storeSql(store)}
        GROUP BY 1
      `,
      // manual_revenues.date는 DATE 컬럼이라 타임존 변환 없이 그대로 일자 사용
      prisma.$queryRaw<Array<{ day: string; total: bigint }>>`
        SELECT
          to_char(date, 'YYYY-MM-DD') AS day,
          COALESCE(SUM(amount), 0)::bigint AS total
        FROM manual_revenues
        WHERE date >= ${startDate}
          AND date <= ${endDate}
          ${storeSql(store)}
        GROUP BY 1
      `,
      prisma.$queryRaw<Array<{ day: string; total: bigint }>>`
        SELECT
          to_char(date AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS day,
          COALESCE(SUM(amount), 0)::bigint AS total
        FROM expenses
        WHERE date >= ${startDate}
          AND date <= ${endDate}
          ${storeSql(store)}
        GROUP BY 1
      `,
      findMemoDatesInRange(`${yearMonth}-01`, lastDayStr),
    ])

  const toMap = (rows: Array<{ day: string; total: bigint }>): Map<string, number> => {
    const map = new Map<string, number>()
    for (const row of rows) map.set(row.day, Number(row.total))
    return map
  }

  const naverMap = toMap(naverByDay)
  const orderProfitMap = toMap(orderProfitByDay)
  const manualRevenueMap = toMap(manualRevenueByDay)
  const expenseMap = toMap(expenseByDay)
  const memoSet = new Set(memoDates)

  const result: RevenueCalendarItem[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${yearMonth}-${String(day).padStart(2, '0')}`
    const naverRevenue = naverMap.get(key) ?? 0
    const orderProfit = orderProfitMap.get(key) ?? 0
    const manualRevenue = manualRevenueMap.get(key) ?? 0
    const expense = expenseMap.get(key) ?? 0
    const naverSettlement = naverRevenue - Math.round(naverRevenue * NAVER_FEE_RATE)

    result.push({
      date: key,
      totalRevenue: naverRevenue + manualRevenue + orderProfit,
      netProfit: naverSettlement + manualRevenue + orderProfit - expense,
      hasMemo: memoSet.has(key),
    })
  }

  return result
}

export async function getProductRanking(store?: Store) {
  const rankings = await prisma.steamOrderItem.groupBy({
    by: ['productName'],
    where: {
      source: 'naver',
      fulfillmentStatus: { not: 'returned' },
      ...(store ? { store } : {}),
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

export async function getAverageDecisionDays(store?: Store) {
  const result = await prisma.$queryRaw<Array<{ avg_days: number | null }>>`
    SELECT AVG(
      EXTRACT(EPOCH FROM (decision_date - paid_at)) / 86400.0
    ) AS avg_days
    FROM steam_order_items
    WHERE source = 'naver'
      AND decision_date IS NOT NULL
      AND paid_at IS NOT NULL
      ${storeSql(store)}
  `

  const avgDays = result[0]?.avg_days
  return avgDays !== null && avgDays !== undefined
    ? Math.round(avgDays * 10) / 10
    : 0
}
