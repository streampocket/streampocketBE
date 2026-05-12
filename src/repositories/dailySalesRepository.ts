import { prisma } from '../lib/prisma'

export async function countOrdersPaidOn(start: Date, end: Date): Promise<number> {
  return prisma.steamOrderItem.count({
    where: { paidAt: { gte: start, lte: end } },
  })
}

export async function countOrdersDecidedOn(start: Date, end: Date): Promise<number> {
  return prisma.steamOrderItem.count({
    where: { decisionDate: { gte: start, lte: end } },
  })
}

export async function countOrdersReturnedOn(start: Date, end: Date): Promise<number> {
  return prisma.steamOrderItem.count({
    where: { returnedAt: { gte: start, lte: end } },
  })
}

// paidAt이 범위 내 AND returnedAt IS NULL — 오늘 결제→오늘 반품 건은 매출에서 제외
export async function sumPaymentAmountPaidOn(start: Date, end: Date): Promise<number> {
  const result = await prisma.steamOrderItem.aggregate({
    _sum: { paymentAmount: true },
    where: {
      paidAt: { gte: start, lte: end },
      returnedAt: null,
    },
  })
  return result._sum.paymentAmount ?? 0
}
