import { Request, Response } from 'express'
import { z } from 'zod'
import { getOrderTracking } from '../services/steamOrderService'

const trackParamsSchema = z.object({
  productOrderId: z.string().trim().min(1).max(100),
})

// 구매자용 공개 진행상황 조회 (인증 없음)
export async function getOrderTrackingHandler(req: Request, res: Response): Promise<void> {
  const { productOrderId } = trackParamsSchema.parse(req.params)
  const tracking = await getOrderTracking(productOrderId)
  res.json({ data: tracking })
}
