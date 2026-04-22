import { prisma } from '../../lib/prisma'
import { findOwnProductById } from '../../repositories/own/ownProductRepository'
import {
  findActiveApplication,
  findApplicationsByUserId,
  findApplicationWithProduct,
} from '../../repositories/own/partyApplicationRepository'
import { decrypt } from '../../utils/crypto'
import { isPartyJoinable, calculateCurrentPrice } from '../../utils/partyPricing'

const FEE_RATE = 0.1

export const PAY_METHOD_VALUES = ['kakaopay', 'card', 'transfer', 'virtualAccount', 'mobile'] as const
export type PayMethod = (typeof PAY_METHOD_VALUES)[number]

export async function applyToParty(productId: string, userId: string, payMethod: PayMethod) {
  const product = await findOwnProductById(productId)
  if (!product) {
    throw Object.assign(new Error('파티를 찾을 수 없습니다.'), { statusCode: 404 })
  }

  const joinCheck = isPartyJoinable(product)
  if (!joinCheck.joinable) {
    throw Object.assign(new Error(joinCheck.reason ?? '참여가 불가합니다.'), { statusCode: 400 })
  }

  if (product.userId === userId) {
    throw Object.assign(new Error('본인의 파티에는 신청할 수 없습니다.'), { statusCode: 403 })
  }

  const existing = await findActiveApplication(productId, userId)
  if (existing && existing.status === 'confirmed') {
    throw Object.assign(new Error('이미 확정된 파티입니다.'), { statusCode: 409 })
  }

  const currentPrice = calculateCurrentPrice(product)
  const fee = Math.round(currentPrice * FEE_RATE)
  const totalAmount = currentPrice + fee
  const pgProvider = payMethod === 'kakaopay' ? 'kakaopay' : 'galaxia'

  const isRetry = existing?.status === 'pending'

  const result = await prisma.$transaction(async (tx) => {
    // 재시도(이미 슬롯 선점됨)가 아닌 경우에만 슬롯 선점
    if (!isRetry) {
      const slotUpdate = await tx.ownProduct.updateMany({
        where: {
          id: productId,
          status: 'recruiting',
          deletedAt: null,
          filledSlots: { lt: product.totalSlots },
        },
        data: { filledSlots: { increment: 1 } },
      })
      if (slotUpdate.count === 0) {
        throw Object.assign(new Error('모집이 마감되었습니다.'), { statusCode: 409 })
      }
    }

    // 기존 신청이 있으면 재사용(pending/cancelled/expired 모두), 없으면 새로 생성
    const prior = await tx.partyApplication.findUnique({
      where: { productId_userId: { productId, userId } },
    })

    let applicationId: string
    if (prior) {
      const updated = await tx.partyApplication.update({
        where: { id: prior.id },
        data: {
          status: 'pending',
          price: currentPrice,
          fee,
          totalAmount,
          startedAt: null,
          expiresAt: null,
        },
      })
      applicationId = updated.id
      // 재시도: 기존 pending 결제는 모두 cancelled 로 정리 (PG 에 실제 제출된 건이 아니므로 DB만 정리)
      await tx.payment.updateMany({
        where: { applicationId, status: 'pending' },
        data: { status: 'cancelled' },
      })
    } else {
      const created = await tx.partyApplication.create({
        data: {
          productId,
          userId,
          price: currentPrice,
          fee,
          totalAmount,
          status: 'pending',
        },
      })
      applicationId = created.id
    }

    const payment = await tx.payment.create({
      data: {
        applicationId,
        amount: totalAmount,
        method: 'pg',
        status: 'pending',
        payMethod,
        pgProvider,
      },
    })

    return { applicationId, payment }
  })

  return {
    data: {
      applicationId: result.applicationId,
      paymentId: result.payment.id,
      amount: totalAmount,
      orderName: `${product.name} (${product.durationDays}일)`,
      payMethod,
      pgProvider,
    },
  }
}

export async function getMyApplications(userId: string) {
  const applications = await findApplicationsByUserId(userId)
  return { data: applications }
}

export async function getApplicationCredentials(applicationId: string, userId: string) {
  const application = await findApplicationWithProduct(applicationId)
  if (!application) {
    throw Object.assign(new Error('신청 내역을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  if (application.userId !== userId) {
    throw Object.assign(new Error('본인의 신청만 조회할 수 있습니다.'), { statusCode: 403 })
  }

  if (application.status === 'expired') {
    throw Object.assign(new Error('이용 기간이 만료되어 계정 정보를 조회할 수 없습니다.'), { statusCode: 403 })
  }

  if (application.status !== 'confirmed') {
    throw Object.assign(new Error('확정된 신청만 계정 정보를 조회할 수 있습니다.'), { statusCode: 403 })
  }

  return {
    data: {
      productName: application.product.name,
      accountId: application.product.accountId ? decrypt(application.product.accountId) : null,
      accountPassword: application.product.accountPassword ? decrypt(application.product.accountPassword) : null,
    },
  }
}

export async function checkApplication(productId: string, userId: string) {
  const application = await findActiveApplication(productId, userId)
  if (!application) {
    return { data: { applied: false, applicationStatus: null, paymentStatus: null } }
  }
  const latestPayment = application.payments[0] ?? null
  return {
    data: {
      applied: true,
      applicationStatus: application.status,
      paymentStatus: latestPayment ? latestPayment.status : null,
    },
  }
}
