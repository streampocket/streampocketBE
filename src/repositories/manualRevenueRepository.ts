import { prisma } from '../lib/prisma'
import { Prisma, Store } from '@prisma/client'

type FindManualRevenuesParams = {
  startDate?: Date
  endDate?: Date
  dateOrder?: 'asc' | 'desc'
  store?: Store
  page: number
  pageSize: number
}

export async function findManualRevenues(params: FindManualRevenuesParams) {
  const { startDate, endDate, dateOrder = 'desc', store, page, pageSize } = params

  const where: Prisma.ManualRevenueWhereInput = {}
  if (store) where.store = store
  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = startDate
    if (endDate) where.date.lte = endDate
  }

  const [items, total] = await Promise.all([
    prisma.manualRevenue.findMany({
      where,
      orderBy: { date: dateOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.manualRevenue.count({ where }),
  ])

  return { items, total }
}

export async function findManualRevenueById(id: string) {
  return prisma.manualRevenue.findUnique({ where: { id } })
}

type CreateManualRevenueData = {
  store?: Store | null
  date: Date
  amount: number
  memo?: string
}

export async function createManualRevenue(data: CreateManualRevenueData) {
  return prisma.manualRevenue.create({ data })
}

type UpdateManualRevenueData = {
  date?: Date
  amount?: number
  memo?: string | null
}

export async function updateManualRevenue(id: string, data: UpdateManualRevenueData) {
  return prisma.manualRevenue.update({ where: { id }, data })
}

export async function deleteManualRevenue(id: string) {
  await prisma.manualRevenue.delete({ where: { id } })
}

export async function sumManualRevenue(
  startDate: Date,
  endDate: Date,
  store?: Store,
): Promise<number> {
  const result = await prisma.manualRevenue.aggregate({
    where: { date: { gte: startDate, lte: endDate }, ...(store ? { store } : {}) },
    _sum: { amount: true },
  })
  return result._sum.amount ?? 0
}
