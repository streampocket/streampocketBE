import { Request, Response } from 'express'
import { z } from 'zod'
import {
  getAlimtalkSettings,
  sendAlimtalkTest,
  updateAlimtalkSettings,
} from '../services/alimtalkService'

const storeEnum = z.enum(['streampocket', 'pokemon_steam'])

// store 쿼리 파라미터 — 미지정 시 기본 스토어(streampocket)
const storeQuerySchema = z.object({
  store: storeEnum.default('streampocket'),
})

const updateAlimtalkSettingsSchema = z.object({
  store: storeEnum,
  enabled: z.boolean(),
})

export async function getAlimtalkSettingsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { store } = storeQuerySchema.parse(req.query)
  const settings = await getAlimtalkSettings(store)
  res.json({ data: settings })
}

export async function updateAlimtalkSettingsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const body = updateAlimtalkSettingsSchema.parse(req.body)
  const settings = await updateAlimtalkSettings(body)
  res.json({ data: settings })
}

export async function sendAlimtalkTestHandler(req: Request, res: Response): Promise<void> {
  const { store } = storeQuerySchema.parse(req.query)
  const result = await sendAlimtalkTest(store)
  res.json({ data: result })
}
