import { Request, Response } from 'express'
import { z } from 'zod'
import {
  ALLOWED_DURATION_MINUTES,
  getSystemSettings,
  updateSystemSettings,
} from '../services/systemSettingsService'

const updateSystemSettingsSchema = z.object({
  defaultDurationMinutes: z
    .number()
    .int()
    .refine((v) => ALLOWED_DURATION_MINUTES.includes(v), {
      message: '허용되지 않는 기본 소요시간입니다.',
    }),
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
