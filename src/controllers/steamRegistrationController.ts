import { Request, Response } from 'express'
import { z } from 'zod'
import { getRegistrationByOrderItem } from '../services/steamRegistrationService'

const byOrderQuerySchema = z.object({
  orderItemId: z.string().trim().min(1),
})

// 주문 상세에서 자동 친구링크 폼이 기존 자격증명을 프리필하려고 호출한다.
// 연결된 접수가 없으면 data: null.
export async function getRegistrationByOrderHandler(req: Request, res: Response): Promise<void> {
  const { orderItemId } = byOrderQuerySchema.parse(req.query)
  const registration = await getRegistrationByOrderItem(orderItemId)
  res.json({ data: registration })
}
