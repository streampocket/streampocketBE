import { Request, Response } from 'express'
import { z } from 'zod'
import { recordVisit, getVisitStats, VisitSite } from '../services/siteVisitService'

const recordVisitSchema = z.object({
  visitorId: z.string().uuid(),
  referrer: z.string().max(500).nullish(),
  utmSource: z.string().max(100).nullish(),
  landingPath: z.string().max(500).nullish(),
})

// site는 라우트 프리픽스에서 고정 — 클라이언트 바디를 신뢰하지 않는다
function makeRecordVisitHandler(site: VisitSite) {
  return async (req: Request, res: Response): Promise<void> => {
    const body = recordVisitSchema.parse(req.body)
    await recordVisit(site, {
      visitorId: body.visitorId,
      referrer: body.referrer ?? null,
      utmSource: body.utmSource ?? null,
      landingPath: body.landingPath ?? null,
      userAgent: req.get('user-agent') ?? null,
    })
    // 중복·봇 스킵 포함 항상 204 (멱등 — 클라이언트는 결과를 구분할 필요 없음)
    res.status(204).send()
  }
}

export const recordGcoinVisitHandler = makeRecordVisitHandler('gcoin')
export const recordOttallVisitHandler = makeRecordVisitHandler('ottall')

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

const statsQuerySchema = z
  .object({
    site: z.enum(['gcoin', 'ottall']).default('ottall'),
    from: dateString.optional(),
    to: dateString.optional(),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: '시작일이 종료일보다 늦을 수 없습니다.',
  })

export async function adminGetVisitStatsHandler(req: Request, res: Response): Promise<void> {
  const query = statsQuerySchema.parse(req.query)
  const data = await getVisitStats(query.site, { from: query.from, to: query.to })
  res.json({ data })
}
