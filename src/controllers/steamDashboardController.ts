import { Request, Response } from 'express'
import { z } from 'zod'
import { getDashboardStats } from '../services/steamDashboardService'

const periodSchema = z.enum(['today', 'week', 'month', 'all']).default('today')

export async function getDashboardStatsHandler(req: Request, res: Response): Promise<void> {
  const period = periodSchema.parse(req.query.period)
  const stats = await getDashboardStats(period)
  res.json({ data: stats })
}
