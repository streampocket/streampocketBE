import { z } from 'zod'
import type { Request, Response } from 'express'
import {
  adminApproveRenewal,
  adminGetRenewalDetail,
  adminRejectRenewal,
  getRenewalQuote,
  requestRenewal,
} from '../../services/own/partyRenewalService'

const idParamSchema = z.object({
  id: z.string().uuid(),
})

// 일반 신청과 같은 규칙 — 쓸지 말지만 받고 금액은 서버가 min(잔액, 총액)으로 정한다
const requestBodySchema = z.object({
  usePoint: z.boolean().default(false),
})

// ─────────────── 구매자 (경로의 id = 원 신청 id) ───────────────

export async function getRenewalQuoteHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const result = await getRenewalQuote(id, req.user!.id)
  res.json(result)
}

export async function requestRenewalHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const body = requestBodySchema.parse(req.body ?? {})
  const result = await requestRenewal(id, req.user!.id, body.usePoint)
  res.status(201).json(result)
}

// ─────────────── 관리자 (경로의 id = 재구매 id) ───────────────

export async function adminGetRenewalDetailHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  res.json(await adminGetRenewalDetail(id))
}

export async function adminApproveRenewalHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  res.json(await adminApproveRenewal(id))
}

export async function adminRejectRenewalHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  res.json(await adminRejectRenewal(id))
}
