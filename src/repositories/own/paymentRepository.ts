import { prisma } from '../../lib/prisma'
import type { PaymentStatus, PaymentMethod } from '@prisma/client'

type CreatePaymentInput = {
  applicationId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
}

type ListPaymentsInput = {
  status?: PaymentStatus
  from?: string
  to?: string
  page: number
  pageSize: number
}

const paymentInclude = {
  application: {
    include: {
      product: {
        include: {
          category: true,
          user: { select: { id: true, name: true, phone: true } },
        },
      },
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  },
} as const

export async function findPayments(input: ListPaymentsInput) {
  const where = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.from || input.to
      ? {
          createdAt: {
            ...(input.from ? { gte: new Date(input.from) } : {}),
            ...(input.to ? { lte: new Date(`${input.to}T23:59:59.999Z`) } : {}),
          },
        }
      : {}),
  }

  const [items, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where,
      include: paymentInclude,
      orderBy: { createdAt: 'desc' },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.payment.count({ where }),
  ])

  return { items, total }
}

export function findPaymentById(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: paymentInclude,
  })
}

export function createPayment(data: CreatePaymentInput) {
  return prisma.payment.create({ data })
}

export function updatePaymentStatus(
  id: string,
  data: {
    status: PaymentStatus
    paidAt?: Date | null
    adminNote?: string | null
  },
) {
  return prisma.payment.update({
    where: { id },
    data,
  })
}
