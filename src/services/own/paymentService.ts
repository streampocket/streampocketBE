import { prisma } from '../../lib/prisma'
import type { PaymentStatus } from '@prisma/client'
import {
  findPayments,
  findPaymentById,
} from '../../repositories/own/paymentRepository'
import { sendDiscordAlert } from '../../lib/discord'
import { calculatePartyExpiresAt, isPartyJoinable } from '../../utils/partyPricing'

type ListPaymentsInput = {
  status?: PaymentStatus
  from?: string
  to?: string
  page: number
  pageSize: number
}

export async function getPayments(input: ListPaymentsInput) {
  const { items, total } = await findPayments(input)
  return {
    data: items,
    total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: Math.ceil(total / input.pageSize),
  }
}

export async function getPaymentDetail(id: string) {
  const payment = await findPaymentById(id)
  if (!payment) {
    throw Object.assign(new Error('결제를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return payment
}

export async function approvePayment(id: string, adminNote?: string) {
  const payment = await findPaymentById(id)
  if (!payment) {
    throw Object.assign(new Error('결제를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (payment.status !== 'pending') {
    throw Object.assign(new Error('대기 중인 결제만 승인할 수 있습니다.'), { statusCode: 400 })
  }

  const application = payment.application
  const product = application.product

  const joinCheck = isPartyJoinable(product)
  if (!joinCheck.joinable) {
    throw Object.assign(new Error(joinCheck.reason ?? '참여가 불가합니다.'), { statusCode: 400 })
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id },
      data: {
        status: 'paid',
        paidAt: new Date(),
        ...(adminNote ? { adminNote } : {}),
      },
    })

    const now = new Date()
    const partyStartedAt = product.startedAt ?? now
    const partyExpiresAt = calculatePartyExpiresAt(partyStartedAt, product.durationDays)

    await tx.partyApplication.update({
      where: { id: application.id },
      data: {
        status: 'confirmed',
        startedAt: now,
        expiresAt: partyExpiresAt,
      },
    })

    const isFirstMember = !product.startedAt
    const newFilledSlots = product.filledSlots + 1
    const isFull = newFilledSlots >= product.totalSlots

    await tx.ownProduct.update({
      where: { id: product.id },
      data: {
        filledSlots: { increment: 1 },
        ...(isFirstMember ? { startedAt: now } : {}),
        ...(isFull ? { status: 'closed' } : {}),
      },
    })

    return updatedPayment
  })

  sendDiscordAlert(
    'partyApply',
    `**파티명:** ${product.name}\n**신청자:** ${application.user.name}\n**금액:** ${payment.amount.toLocaleString()}원\n**현재 모집:** ${product.filledSlots + 1}/${product.totalSlots}명`,
  ).catch(() => {})

  return result
}

export async function rejectPayment(id: string, adminNote?: string) {
  const payment = await findPaymentById(id)
  if (!payment) {
    throw Object.assign(new Error('결제를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (payment.status !== 'pending') {
    throw Object.assign(new Error('대기 중인 결제만 거절할 수 있습니다.'), { statusCode: 400 })
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id },
      data: {
        status: 'cancelled',
        ...(adminNote ? { adminNote } : {}),
      },
    })

    await tx.partyApplication.update({
      where: { id: payment.application.id },
      data: { status: 'cancelled' },
    })

    return updatedPayment
  })

  return result
}
