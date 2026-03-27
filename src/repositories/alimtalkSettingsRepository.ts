import { AlimtalkSettings } from '@prisma/client'
import { prisma } from '../lib/prisma'

export async function getAlimtalkSettings(): Promise<AlimtalkSettings | null> {
  return prisma.alimtalkSettings.findFirst()
}

export async function upsertAlimtalkSettings(
  enabled: boolean,
  messageTemplate: string,
): Promise<AlimtalkSettings> {
  const existing = await prisma.alimtalkSettings.findFirst()

  if (existing) {
    return prisma.alimtalkSettings.update({
      where: { id: existing.id },
      data: { enabled, messageTemplate },
    })
  }

  return prisma.alimtalkSettings.create({
    data: { enabled, messageTemplate },
  })
}
