import { Request, Response } from 'express'
import { z } from 'zod'
import {
  getDashboardStats,
  getRevenueChart,
  getProductRanking,
  getAverageDecisionDays,
} from '../services/steamDashboardService'

const periodSchema = z.enum(['today', 'week', 'month', 'all']).default('today')

export async function getDashboardStatsHandler(req: Request, res: Response): Promise<void> {
  const period = periodSchema.parse(req.query.period)
  const stats = await getDashboardStats(period)
  res.json({ data: stats })
}

const daysSchema = z.coerce.number().refine((v) => [7, 30, 90].includes(v)).default(30)

export async function getRevenueChartHandler(req: Request, res: Response): Promise<void> {
  const days = daysSchema.parse(req.query.days)
  const chart = await getRevenueChart(days)
  res.json({ data: chart })
}

export async function getDashboardExtrasHandler(_req: Request, res: Response): Promise<void> {
  const [productRanking, averageDecisionDays] = await Promise.all([
    getProductRanking(),
    getAverageDecisionDays(),
  ])
  res.json({ data: { productRanking, averageDecisionDays } })
}
