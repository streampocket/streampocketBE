import { z } from 'zod'
import type { Request, Response } from 'express'
import {
  issuePartyOtp,
  adminGetPartyOtpInfo,
  adminSetPartyOtpSecret,
  adminResetPartyOtpCount,
} from '../../services/own/partyOtpService'

const idParamSchema = z.object({
  id: z.string().uuid(),
})

// 실질 유효성(Base32)은 서비스에서 검증 — 여기서는 길이만 제한
const otpSecretBodySchema = z.object({
  secret: z.string().trim().min(1).max(128),
})

// ─────────────── 유저용 ───────────────

export async function issuePartyOtpHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const userId = req.user!.id
  const result = await issuePartyOtp(id, userId)
  res.json(result)
}

// ─────────────── 관리자용 (주문 id 기준) ───────────────

export async function adminGetPartyOtpInfoHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const result = await adminGetPartyOtpInfo(id)
  res.json(result)
}

export async function adminSetPartyOtpSecretHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const { secret } = otpSecretBodySchema.parse(req.body)
  const result = await adminSetPartyOtpSecret(id, secret)
  res.json(result)
}

export async function adminResetPartyOtpCountHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const result = await adminResetPartyOtpCount(id)
  res.json(result)
}
