import { SystemSettings } from '@prisma/client'
import { prisma } from '../lib/prisma'

export async function getSystemSettingsRow(): Promise<SystemSettings | null> {
  return prisma.systemSettings.findFirst()
}

type SystemSettingsUpdate = {
  defaultDurationMinutes?: number
  reviewPointTier1Max?: number
  reviewPointTier2Max?: number
  reviewPointTier1Point?: number
  reviewPointTier2Point?: number
  reviewPointTier3Point?: number
}

export async function upsertSystemSettings(data: SystemSettingsUpdate): Promise<SystemSettings> {
  const existing = await prisma.systemSettings.findFirst()

  if (existing) {
    return prisma.systemSettings.update({ where: { id: existing.id }, data })
  }

  return prisma.systemSettings.create({ data })
}
