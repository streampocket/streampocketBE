import { SystemSettings } from '@prisma/client'
import { prisma } from '../lib/prisma'

export async function getSystemSettingsRow(): Promise<SystemSettings | null> {
  return prisma.systemSettings.findFirst()
}

export async function upsertSystemSettings(data: {
  defaultDurationMinutes: number
}): Promise<SystemSettings> {
  const existing = await prisma.systemSettings.findFirst()

  if (existing) {
    return prisma.systemSettings.update({ where: { id: existing.id }, data })
  }

  return prisma.systemSettings.create({ data })
}
