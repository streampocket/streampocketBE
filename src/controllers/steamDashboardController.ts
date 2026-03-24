import { Request, Response } from 'express'
import { getDashboardStats } from '../services/steamDashboardService'

export async function getDashboardStatsHandler(_req: Request, res: Response): Promise<void> {
  const stats = await getDashboardStats()
  res.json({ data: stats })
}
