import { Request, Response } from 'express'
import { z } from 'zod'
import { resolveRequestUser } from '../../lib/requestUser'
import { notifyUserSiteError } from '../../services/userErrorAlertService'

const reportErrorSchema = z.object({
  message: z.string().min(1).max(500),
  path: z.string().min(1).max(300).startsWith('/'),
  digest: z.string().max(100).nullish(),
})

// 무인증 공개 엔드포인트 스팸 방어 — IP당 분당 5회
const IP_LIMIT_PER_MINUTE = 5
const IP_MAP_MAX_ENTRIES = 500
const ipWindows = new Map<string, { windowStartedAt: number; count: number }>()

function isOverIpLimit(ip: string, now: number): boolean {
  const window = ipWindows.get(ip)
  if (!window || now - window.windowStartedAt >= 60 * 1000) {
    if (ipWindows.size >= IP_MAP_MAX_ENTRIES) {
      for (const [key, w] of ipWindows) {
        if (now - w.windowStartedAt >= 60 * 1000) ipWindows.delete(key)
      }
    }
    ipWindows.set(ip, { windowStartedAt: now, count: 1 })
    return false
  }
  window.count += 1
  return window.count > IP_LIMIT_PER_MINUTE
}

// fe 화면 크래시 보고 수신 → 디스코드 알림. 차단·성공 무관 항상 204 (내부 동작 비노출)
export async function reportUserErrorHandler(req: Request, res: Response): Promise<void> {
  if (isOverIpLimit(req.ip ?? 'unknown', Date.now())) {
    res.status(204).send()
    return
  }

  const body = reportErrorSchema.parse(req.body)

  notifyUserSiteError({
    source: 'fe',
    message: body.message,
    // 쿼리 제거 — 알림에는 경로만 (검색어 등 노출 방지)
    path: body.path.split('?')[0] ?? body.path,
    // 신원은 클라이언트 바디가 아니라 서버가 토큰을 직접 검증해 식별 (위조 방지)
    user: resolveRequestUser(req),
    userAgent: req.get('user-agent') ?? null,
    digest: body.digest ?? null,
  })

  res.status(204).send()
}
