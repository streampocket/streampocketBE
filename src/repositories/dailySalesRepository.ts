import { prisma } from '../lib/prisma'

export async function countOrdersPaidOn(start: Date, end: Date): Promise<number> {
  return prisma.steamOrderItem.count({
    where: { paidAt: { gte: start, lte: end } },
  })
}

// 모집단을 paidAt 기준으로 통일 — 오늘 결제된 주문 중 구매확정된 건만 카운트
export async function countOrdersDecidedOn(start: Date, end: Date): Promise<number> {
  return prisma.steamOrderItem.count({
    where: {
      paidAt: { gte: start, lte: end },
      decisionDate: { not: null },
    },
  })
}

// 모집단을 paidAt 기준으로 통일 — 오늘 결제된 주문 중 반품된 건만 카운트
export async function countOrdersReturnedOn(start: Date, end: Date): Promise<number> {
  return prisma.steamOrderItem.count({
    where: {
      paidAt: { gte: start, lte: end },
      returnedAt: { not: null },
    },
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
