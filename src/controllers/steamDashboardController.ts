import { Request, Response } from 'express'
import { z } from 'zod'
import {
  getDashboardStats,
  getRevenueChart,
  getProductRanking,
  getAverageDecisionDays,
} from '../services/steamDashboardService'

const periodSchema = z.enum(['today', 'week', 'month', 'all']).default('today')
// store 미지정 = 전체(공통 포함). 지정 시 해당 store만(공통 제외).
const storeSchema = z.enum(['streampocket', 'pokemon_steam']).optional()

export async function getDashboardStatsHandler(req: Request, res: Response): Promise<void> {
  const period = periodSchema.parse(req.query.period)
  const store = storeSchema.parse(req.query.store)
  const stats = await getDashboardStats(period, store)
  res.json({ data: stats })
}

const daysSchema = z.coerce.number().refine((v) => [7, 30, 90].includes(v)).default(30)

export async function getRevenueChartHandler(req: Request, res: Response): Promise<void> {
  const days = daysSchema.parse(req.query.days)
  const store = storeSchema.parse(req.query.store)
  const chart = await getRevenueChart(days, store)
  res.json({ data: chart })
}

export async function getDashboardExtrasHandler(req: Request, res: Response): Promise<void> {
  const store = storeSchema.parse(req.query.store)
  const [productRanking, averageDecisionDays] = await Promise.all([
    getProductRanking(store),
    getAverageDecisionDays(store),
  ])
  res.json({ data: { productRanking, averageDecisionDays } })
}
