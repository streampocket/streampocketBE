import { prisma } from '../lib/prisma'

export async function getAlimtalkUnitCost(): Promise<number> {
  const settings = await prisma.systemSettings.findFirst()
  return settings?.alimtalkUnitCost ? Number(settings.alimtalkUnitCost) : 6.5
}

export async function upsertAlimtalkUnitCost(cost: number): Promise<number> {
  const existing = await prisma.systemSettings.findFirst()
  if (existing) {
    const updated = await prisma.systemSettings.update({
      where: { id: existing.id },
      data: { alimtalkUnitCost: cost },
    })
    return Number(updated.alimtalkUnitCost)
  }
  const created = await prisma.systemSettings.create({
    data: { alimtalkUnitCost: cost },
  })
  return Number(created.alimtalkUnitCost)
}
