import { Request, Response } from 'express'
import { pollAndProcess } from '../services/steamFulfillmentService'
import { naverOrderSource } from '../services/platform/naverOrderSource'

export async function pollOrders(_req: Request, res: Response): Promise<void> {
  const processedCount = await pollAndProcess(naverOrderSource)
  res.json({ message: '폴링 완료', processedCount })
}
