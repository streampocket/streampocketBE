import { findOwnProductById } from '../../repositories/own/ownProductRepository'
import {
  findActiveApplication,
  createApplication,
  findApplicationsByUserId,
  findApplicationWithProduct,
} from '../../repositories/own/partyApplicationRepository'
import { createPayment } from '../../repositories/own/paymentRepository'
import { sendDiscordAlert } from '../../lib/discord'
import { decrypt } from '../../utils/crypto'
import { isPartyJoinable, calculateCurrentPrice } from '../../utils/partyPricing'

const FEE_RATE = 0.1

export async function applyToParty(productId: string, userId: string) {
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
  if (existing) {
    throw Object.assign(new Error('이미 신청한 파티입니다.'), { statusCode: 409 })
  }

  const currentPrice = calculateCurrentPrice(product)
  const fee = Math.round(currentPrice * FEE_RATE)
  const totalAmount = currentPrice + fee

  const application = await createApplication({
    productId,
    userId,
    price: currentPrice,
    fee,
    totalAmount,
  })

  await createPayment({
    applicationId: application.id,
    amount: totalAmount,
    method: 'manual',
    status: 'pending',
  })

  // Discord 알림 — 결제 요청 (비동기 — 실패해도 신청 성공)
  sendDiscordAlert(
    'paymentRequest',
    `**파티명:** ${product.name}\n**신청자:** 사용자\n**가격:** ${currentPrice.toLocaleString()}원${currentPrice < product.price ? ` (원가 ${product.price.toLocaleString()}원)` : ''}\n**수수료:** ${fee.toLocaleString()}원\n**합계:** ${totalAmount.toLocaleString()}원`,
  ).catch(() => {})

  return { data: application }
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
