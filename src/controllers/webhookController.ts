import { Request, Response } from 'express'

export async function handlePaymentWebhook(_req: Request, res: Response): Promise<void> {
  // TODO: 자체 플랫폼 결제 웹훅 처리 구현
  res.json({ message: 'ok' })
}
