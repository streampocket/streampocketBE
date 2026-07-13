import { z } from 'zod'
import type { Request, Response } from 'express'
import { sendAuthCode, verifyAuthCode } from '../../services/gcoin/gcoinAuthService'

const phoneSendSchema = z.object({
  phone: z.string().regex(/^010\d{8}$/, '올바른 휴대폰 번호를 입력해주세요.'),
  privacyAgreed: z.boolean(),
})

const phoneVerifySchema = z.object({
  phone: z.string().regex(/^010\d{8}$/),
  code: z.string().length(6),
})

export async function gcoinAuthSendHandler(req: Request, res: Response): Promise<void> {
  const { phone, privacyAgreed } = phoneSendSchema.parse(req.body)
  const result = await sendAuthCode(phone, privacyAgreed)
  res.json({ data: result })
}

export async function gcoinAuthVerifyHandler(req: Request, res: Response): Promise<void> {
  const { phone, code } = phoneVerifySchema.parse(req.body)
  const result = await verifyAuthCode(phone, code)
  res.json({ data: result })
}
