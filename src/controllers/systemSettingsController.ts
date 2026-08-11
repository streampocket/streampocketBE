import { Request, Response } from 'express'
import { z } from 'zod'
import {
  ALLOWED_DURATION_MINUTES,
  getSystemSettings,
  updateSystemSettings,
} from '../services/systemSettingsService'

const positiveInt = z.number().int().min(0, '0 이상이어야 합니다.')

// 리뷰 적립 구간 — 개수가 3으로 고정이라 배열이 아니라 이름 붙은 필드로 받는다.
// 경계 역전(tier1Max >= tier2Max) 검증은 서비스에서 한다 (저장 직전 한 곳에서만 판정).
const reviewPointTiersSchema = z.object({
  tier1Max: positiveInt,
  tier2Max: positiveInt,
  tier1Point: positiveInt,
  tier2Point: positiveInt,
  tier3Point: positiveInt,
})

// 두 설정은 화면이 따로라 각각 단독으로 보낼 수 있어야 한다
const updateSystemSettingsSchema = z
  .object({
    defaultDurationMinutes: z
      .number()
      .int()
      .refine((v) => ALLOWED_DURATION_MINUTES.includes(v), {
        message: '허용되지 않는 기본 소요시간입니다.',
      })
      .optional(),
    reviewPointTiers: reviewPointTiersSchema.optional(),
  })
  .refine((body) => body.defaultDurationMinutes !== undefined || body.reviewPointTiers !== undefined, {
    message: '변경할 설정이 없습니다.',
  })

export async function getSystemSettingsHandler(_req: Request, res: Response): Promise<void> {
  const settings = await getSystemSettings()
  res.json({ data: settings })
}

export async function updateSystemSettingsHandler(req: Request, res: Response): Promise<void> {
  const body = updateSystemSettingsSchema.parse(req.body)
  const settings = await updateSystemSettings(body)
  res.json({ data: settings })
}
