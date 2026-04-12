import { Request, Response } from 'express'
import { z } from 'zod'
import { sendReviewGame } from '../services/reviewGameService'

const orderIdParamSchema = z.object({
  id: z.string().uuid(),
})

export async function sendReviewGameHandler(req: Request, res: Response): Promise<void> {
  const { id } = orderIdParamSchema.parse(req.params)
  const result = await sendReviewGame(id)
  res.json({ message: '리뷰게임 코드 발송 완료', count: result.count })
}
