import { Request, Response } from 'express'

export async function getDashboardStats(_req: Request, res: Response): Promise<void> {
  // TODO: dashboardService.getStats() 구현
  res.status(501).json({ message: '미구현' })
}
