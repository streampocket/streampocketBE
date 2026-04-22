import { prisma } from '../../lib/prisma'
import type { PaymentStatus } from '@prisma/client'
import {
  findPayments,
  findPaymentById,
  deletePaymentById,
} from '../../repositories/own/paymentRepository'
import { sendDiscordAlert } from '../../lib/discord'
import { calculatePartyExpiresAt, isPartyJoinable } from '../../utils/partyPricing'
import { getPaymentFromPortOne } from '../../lib/portone'

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

export async function verifyPgPayment(paymentId: string, userId: string) {
  const payment = await findPaymentById(paymentId)
  if (!payment) {
    throw Object.assign(new Error('결제를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (payment.application.userId !== userId) {
    throw Object.assign(new Error('본인의 결제만 검증할 수 있습니다.'), { statusCode: 403 })
  }
  if (payment.method !== 'pg') {
    throw Object.assign(new Error('PG 결제만 검증할 수 있습니다.'), { statusCode: 400 })
  }

  // 이미 paid 처리된 건은 멱등 응답
  if (payment.status === 'paid') {
    return { data: { paymentId, status: 'paid' as const, applicationId: payment.applicationId } }
  }
  if (payment.status === 'cancelled') {
    throw Object.assign(new Error('이미 취소된 결제입니다.'), { statusCode: 400 })
  }

  const product = payment.application.product

  let portOnePayment
  try {
    portOnePayment = await getPaymentFromPortOne(paymentId)
  } catch (err) {
    throw err
  }

  const matchesProvider =
    !portOnePayment.channel?.pgProvider ||
    (payment.pgProvider === 'kakaopay' && portOnePayment.channel.pgProvider.toLowerCase().includes('kakao')) ||
    (payment.pgProvider === 'galaxia' && portOnePayment.channel.pgProvider.toLowerCase().includes('galaxia'))

  const amountMatches = portOnePayment.amount.total === payment.amount
  const currencyMatches = portOnePayment.currency === 'KRW'

  if (portOnePayment.status !== 'PAID' || !amountMatches || !currencyMatches || !matchesProvider) {
    // 결제 실패/취소/금액 불일치 → 상태 정리 + 슬롯 복원
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'cancelled',
          adminNote: `검증 실패: status=${portOnePayment.status}, amount=${portOnePayment.amount.total}/${payment.amount}, currency=${portOnePayment.currency}, provider=${portOnePayment.channel?.pgProvider ?? 'n/a'}`,
        },
      })
      await tx.partyApplication.update({
        where: { id: payment.applicationId },
        data: { status: 'cancelled' },
      })
      await tx.ownProduct.updateMany({
        where: { id: product.id, filledSlots: { gt: 0 } },
        data: { filledSlots: { decrement: 1 } },
      })
    })
    const reason =
      portOnePayment.status === 'PAID' ? '결제 금액/통화/채널 불일치' : `결제 상태 ${portOnePayment.status}`
    throw Object.assign(new Error(`결제 검증 실패: ${reason}`), { statusCode: 400 })
  }

  // 성공: Payment=paid, PartyApplication=confirmed, OwnProduct.startedAt/status 갱신
  const now = new Date()
  const partyStartedAt = product.startedAt ?? now
  const partyExpiresAt = calculatePartyExpiresAt(partyStartedAt, product.durationDays)

  const updated = await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: 'paid',
        paidAt: now,
        pgTransactionId: portOnePayment.transactionId ?? null,
      },
    })

    await tx.partyApplication.update({
      where: { id: payment.applicationId },
      data: {
        status: 'confirmed',
        startedAt: now,
        expiresAt: partyExpiresAt,
      },
    })

    const isFirstMember = !product.startedAt
    const isFull = product.filledSlots >= product.totalSlots // 슬롯은 이미 apply 시 선점됨
    await tx.ownProduct.update({
      where: { id: product.id },
      data: {
        ...(isFirstMember ? { startedAt: now } : {}),
        ...(isFull ? { status: 'closed' as const } : {}),
      },
    })

    return { paymentId, status: 'paid' as const, applicationId: payment.applicationId }
  })

  sendDiscordAlert(
    'partyApply',
    `**파티명:** ${product.name}\n**신청자:** ${payment.application.user.name}\n**금액:** ${payment.amount.toLocaleString()}원\n**결제수단:** ${payment.pgProvider}/${payment.payMethod}\n**현재 모집:** ${product.filledSlots}/${product.totalSlots}명`,
  ).catch(() => {})

  return { data: updated }
}

export async function abortPendingPayment(paymentId: string, userId: string) {
  const payment = await findPaymentById(paymentId)
  if (!payment) {
    throw Object.assign(new Error('결제를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (payment.application.userId !== userId) {
    throw Object.assign(new Error('본인의 결제만 취소할 수 있습니다.'), { statusCode: 403 })
  }
  if (payment.status !== 'pending') {
    return { data: { paymentId, status: payment.status } }
  }

  const application = payment.application
  const product = application.product

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: { status: 'cancelled' },
    })
    await tx.partyApplication.update({
      where: { id: application.id },
      data: { status: 'cancelled' },
    })
    await tx.ownProduct.updateMany({
      where: { id: product.id, filledSlots: { gt: 0 } },
      data: { filledSlots: { decrement: 1 } },
    })
  })

  return { data: { paymentId, status: 'cancelled' as const } }
}

export async function deletePayment(id: string) {
  const payment = await findPaymentById(id)
  if (!payment) {
    throw Object.assign(new Error('결제를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (payment.method !== 'manual') {
    throw Object.assign(new Error('수동 결제만 삭제할 수 있습니다.'), { statusCode: 400 })
  }

  const application = payment.application
  const product = application.product

  await prisma.$transaction(async (tx) => {
    // Payment 삭제
    await tx.payment.delete({ where: { id } })

    if (payment.status === 'pending') {
      // pending: 아직 확정 전이므로 application도 함께 삭제
      await tx.partyApplication.delete({ where: { id: application.id } })
    } else if (payment.status === 'paid') {
      // paid: application을 cancelled로, product 슬롯 복원
      await tx.partyApplication.update({
        where: { id: application.id },
        data: { status: 'cancelled', startedAt: null, expiresAt: null },
      })

      await tx.ownProduct.update({
        where: { id: product.id },
        data: {
          filledSlots: { decrement: 1 },
          ...(product.status === 'closed' ? { status: 'recruiting' } : {}),
        },
      })
    }
    // cancelled: Payment만 삭제, 나머지 변경 없음
  })
}
