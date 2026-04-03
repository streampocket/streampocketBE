import { prisma } from '../lib/prisma'

export async function getCommissionRate(): Promise<number> {
  const settings = await prisma.systemSettings.findFirst()
  return settings?.commissionRate ? Number(settings.commissionRate) : 0
}

export async function upsertCommissionRate(rate: number): Promise<number> {
  const existing = await prisma.systemSettings.findFirst()
  if (existing) {
    const updated = await prisma.systemSettings.update({
      where: { id: existing.id },
      data: { commissionRate: rate },
    })
    return Number(updated.commissionRate)
  }
  const created = await prisma.systemSettings.create({
    data: { commissionRate: rate },
  })
  return Number(created.commissionRate)
}

export async function findMonthlyAdjustment(yearMonth: string) {
  return prisma.monthlyAdjustment.findUnique({ where: { yearMonth } })
}

export async function findAllMonthlyAdjustments() {
  return prisma.monthlyAdjustment.findMany()
}

export async function upsertMonthlyAdjustment(
  yearMonth: string,
  data: {
    paymentAdjustment: number
    commissionAdjustment: number
    netRevenueAdjustment: number
    memo?: string
  },
) {
  return prisma.monthlyAdjustment.upsert({
    where: { yearMonth },
    update: data,
    create: { yearMonth, ...data },
  })
}
