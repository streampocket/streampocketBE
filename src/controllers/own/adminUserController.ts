import { z } from 'zod'
import type { Request, Response } from 'express'
import { getUsers, getUserDetail, getSignupStats } from '../../services/own/adminUserService'
import { adminWithdrawUser } from '../../services/own/userWithdrawalService'

// ───────────────────────── Zod 스키마 ─────────────────────────

const listQuerySchema = z.object({
  search: z.string().optional(),
  provider: z.enum(['local', 'kakao', 'google']).optional(),
  status: z.enum(['active', 'withdrawn']).default('active'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

const idParamSchema = z.object({
  id: z.string().uuid(),
})

const withdrawBodySchema = z.object({
  reason: z.string().trim().min(1, '탈퇴 사유를 입력해주세요.').max(300),
})

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식이어야 합니다.')

// 가입자 수 조회 — siteVisitController의 statsQuerySchema와 같은 형태
const signupStatsQuerySchema = z
  .object({ from: dateString, to: dateString })
  .refine((query) => query.from <= query.to, {
    message: '시작일이 종료일보다 늦을 수 없습니다.',
  })

// ───────────────────────── 관리자용 핸들러 ─────────────────────────

export async function adminGetUsersHandler(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query)
  const result = await getUsers(query)
  res.json(result)
}

/** 가입자 수 (오늘 + 조회 기간) — 방문자 통계 화면용 */
export async function adminGetSignupStatsHandler(req: Request, res: Response): Promise<void> {
  const query = signupStatsQuerySchema.parse(req.query)
  const data = await getSignupStats(query)
  res.json({ data })
}

export async function adminGetUserDetailHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const detail = await getUserDetail(id)
  res.json({ data: detail })
}

export async function adminWithdrawUserHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const body = withdrawBodySchema.parse(req.body)
  const result = await adminWithdrawUser(id, body.reason)
  res.json({ message: '탈퇴 처리가 완료되었습니다.', ...result })
}
