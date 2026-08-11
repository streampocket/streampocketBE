import { z } from 'zod'
import type { Request, Response } from 'express'
import {
  applyToParty,
  checkApplication,
  getMyApplications,
  adminGetApplications,
  adminGetApplicationDetail,
  adminApproveApplication,
  adminRejectApplication,
  adminCancelApplication,
  getApplicationHourlyStats,
} from '../../services/own/partyApplicationService'

const idParamSchema = z.object({
  id: z.string().uuid(),
})

const adminListQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'expired']).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식이어야 합니다.')

// 시간대 통계 조회 — siteVisitController의 statsQuerySchema와 같은 형태
const hourlyQuerySchema = z
  .object({ from: dateString, to: dateString })
  .refine((query) => query.from <= query.to, {
    message: '시작일이 종료일보다 늦을 수 없습니다.',
  })

// 사용 금액이 아니라 "쓸지 말지"만 받는다 — 금액은 서버가 min(잔액, 총액)으로 정한다.
// 클라이언트가 보낸 숫자를 신뢰하면 조작 여지가 생긴다.
const applyBodySchema = z.object({
  usePoint: z.boolean().default(false),
})

export async function applyToPartyHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const body = applyBodySchema.parse(req.body ?? {})
  const userId = req.user!.id
  const result = await applyToParty(id, userId, body.usePoint)
  res.status(201).json(result)
}

export async function checkApplicationHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const userId = req.user!.id
  const result = await checkApplication(id, userId)
  res.json(result)
}

export async function getMyApplicationsHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const result = await getMyApplications(userId)
  res.json(result)
}

// ─────────────── 관리자용 ───────────────

export async function adminGetApplicationsHandler(req: Request, res: Response): Promise<void> {
  const query = adminListQuerySchema.parse(req.query)
  const result = await adminGetApplications(query)
  res.json(result)
}

/** 신청이 들어온 시간대 분포 — 기준은 이용자가 신청한 시각(관리자 승인 시각이 아니다) */
export async function adminGetApplicationHoursHandler(req: Request, res: Response): Promise<void> {
  const query = hourlyQuerySchema.parse(req.query)
  const data = await getApplicationHourlyStats(query)
  res.json({ data })
}

export async function adminGetApplicationDetailHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const result = await adminGetApplicationDetail(id)
  res.json(result)
}

export async function adminApproveApplicationHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const result = await adminApproveApplication(id)
  res.json(result)
}

export async function adminRejectApplicationHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const result = await adminRejectApplication(id)
  res.json(result)
}

// 확정 파티원 제거 (파티관리) — 파티원 제외 + 연결 주문 자동 반품
export async function adminCancelApplicationHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const result = await adminCancelApplication(id)
  res.json(result)
}
