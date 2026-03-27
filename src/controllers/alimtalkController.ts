import { Request, Response } from 'express'
import { z } from 'zod'
import {
  getAlimtalkSettings,
  sendAlimtalkTest,
  updateAlimtalkSettings,
} from '../services/alimtalkService'

const updateAlimtalkSettingsSchema = z.object({
  enabled: z.boolean(),
})

export async function getAlimtalkSettingsHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  const settings = await getAlimtalkSettings()
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

export async function sendAlimtalkTestHandler(_req: Request, res: Response): Promise<void> {
  const result = await sendAlimtalkTest()
  res.json({ data: result })
}
