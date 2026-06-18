import { AlimtalkSettings, Store } from '@prisma/client'
import { prisma } from '../lib/prisma'

export async function getAlimtalkSettings(store: Store): Promise<AlimtalkSettings | null> {
  return prisma.alimtalkSettings.findUnique({ where: { store } })
}

export async function upsertAlimtalkSettings(
  store: Store,
  enabled: boolean,
  messageTemplate: string,
): Promise<AlimtalkSettings> {
  return prisma.alimtalkSettings.upsert({
    where: { store },
    update: { enabled, messageTemplate },
    create: { store, enabled, messageTemplate },
  })
}
