import { Request, Response } from 'express'
import { z } from 'zod'
import {
  autoGenerateFriendLinks,
  submitGuardCodeAndGenerate,
  pollGuardAndGenerate,
} from '../services/steamFriendLinkService'

const credsSchema = z
  .object({
    steamId: z.string().trim().min(1, '스팀 ID를 입력하세요.'),
    steamPassword: z.string().min(1, '스팀 비밀번호를 입력하세요.'),
    authType: z.enum(['guard_disabled', 'backup_code', 'guard_live']),
    backupCode: z.string().trim().optional(),
  })
  .refine((d) => d.authType !== 'backup_code' || !!d.backupCode, {
    message: '백업코드를 입력하세요.',
    path: ['backupCode'],
  })

// POST /steam/admin/orders/:id/auto-friend-link
export async function autoFriendLinkHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const body = credsSchema.parse(req.body)
  const result = await autoGenerateFriendLinks(req.params.id, body)
  res.json({ data: result })
}

const guardCodeSchema = z.object({
  sessionId: z.string().trim().min(1),
  code: z.string().trim().min(1).max(20),
})

// POST /steam/admin/orders/:id/auto-friend-link/guard-code (코드 방식)
export async function submitGuardCodeHandler(
  _req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const body = guardCodeSchema.parse(_req.body)
  const result = await submitGuardCodeAndGenerate(body.sessionId, body.code)
  res.json({ data: result })
}

const pollSchema = z.object({ sessionId: z.string().trim().min(1) })

// POST /steam/admin/orders/:id/auto-friend-link/status (승인 방식 폴링)
export async function pollGuardHandler(
  _req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const body = pollSchema.parse(_req.body)
  const result = await pollGuardAndGenerate(body.sessionId)
  res.json({ data: result })
}
