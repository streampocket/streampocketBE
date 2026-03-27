import { Request, Response } from 'express'
import { runOrderPolling } from '../services/steamFulfillmentService'
import { naverOrderSource } from '../services/platform/naverOrderSource'

export async function pollOrders(_req: Request, res: Response): Promise<void> {
  const result = await runOrderPolling(naverOrderSource, 'manual')
  res.json({ message: '주문 폴링 완료', ...result })
}
