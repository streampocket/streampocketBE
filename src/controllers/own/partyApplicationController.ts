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

export async function applyToPartyHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const userId = req.user!.id
  const result = await applyToParty(id, userId)
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
