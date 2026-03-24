import { Request, Response } from 'express'

export async function pollOrders(_req: Request, res: Response): Promise<void> {
  // TODO: naverOrderSource.fetchNewOrders() → fulfillmentService 구현
  res.json({ message: '폴링 완료', processedCount: 0 })
}
