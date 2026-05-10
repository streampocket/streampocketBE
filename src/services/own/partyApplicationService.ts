import type { PartyApplicationStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { findOwnProductById } from '../../repositories/own/ownProductRepository'
import {
  findActiveApplication,
  findApplicationsByUserId,
  findApplicationWithProduct,
  findApplicationsForAdmin,
  findApplicationDetailForAdmin,
} from '../../repositories/own/partyApplicationRepository'
import { decrypt } from '../../utils/crypto'
import { isPartyJoinable, calculateCurrentPrice } from '../../utils/partyPricing'
import { sendDiscordAlert } from '../../lib/discord'

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

  const existing = await findActiveApplication(productId, userId)
  if (existing && existing.status === 'confirmed') {
    throw Object.assign(new Error('이미 확정된 파티입니다.'), { statusCode: 409 })
  }
  if (existing && existing.status === 'pending') {
    throw Object.assign(new Error('이미 신청 대기 중입니다.'), { statusCode: 409 })
  }

  const currentPrice = calculateCurrentPrice(product)
  const fee = Math.round(currentPrice * FEE_RATE)
  const totalAmount = currentPrice + fee

  const result = await prisma.$transaction(async (tx) => {
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

    const prior = await tx.partyApplication.findUnique({
      where: { productId_userId: { productId, userId } },
    })

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
      return { applicationId: updated.id }
    }

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
    return { applicationId: created.id }
  })

  await notifyApplicationCreated({
    productName: product.name,
    categoryName: product.category.name,
    userId,
    price: currentPrice,
    fee,
    totalAmount,
  }).catch((err) => {
    console.error('[partyApply] Discord 알림 실패:', err)
  })

  return {
    data: {
      applicationId: result.applicationId,
      price: currentPrice,
      fee,
      totalAmount,
    },
  }
}

type NotifyInput = {
  productName: string
  categoryName: string
  userId: string
  price: number
  fee: number
  totalAmount: number
}

async function notifyApplicationCreated(input: NotifyInput): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { name: true, phone: true },
  })

  const now = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())

  const message = [
    '[신규 파티 참여 신청]',
    `파티: ${input.productName} (${input.categoryName})`,
    `신청자: ${user?.name ?? '(알 수 없음)'} / ${user?.phone ?? '-'}`,
    `금액: ${input.price.toLocaleString()}원 + 수수료 ${input.fee.toLocaleString()}원 = ${input.totalAmount.toLocaleString()}원`,
    `신청일시: ${now} (KST)`,
  ].join('\n')

  await sendDiscordAlert('partyApply', message)
}

// ─────────────── 관리자용 ───────────────

type AdminListInput = {
  status?: PartyApplicationStatus
  search?: string
  page: number
  pageSize: number
}

export async function adminGetApplications(input: AdminListInput) {
  const { items, total } = await findApplicationsForAdmin(input)
  return {
    data: {
      items,
      total,
      page: input.page,
      pageSize: input.pageSize,
      totalPages: Math.ceil(total / input.pageSize),
    },
  }
}

export async function adminGetApplicationDetail(applicationId: string) {
  const application = await findApplicationDetailForAdmin(applicationId)
  if (!application) {
    throw Object.assign(new Error('신청 내역을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return { data: application }
}

export async function adminApproveApplication(applicationId: string) {
  const application = await prisma.partyApplication.findUnique({
    where: { id: applicationId },
    include: { product: { select: { durationDays: true } } },
  })
  if (!application) {
    throw Object.assign(new Error('신청 내역을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (application.status !== 'pending') {
    throw Object.assign(new Error('대기 중인 신청만 승인할 수 있습니다.'), { statusCode: 409 })
  }

  const startedAt = new Date()
  const expiresAt = new Date(startedAt.getTime() + application.product.durationDays * 24 * 60 * 60 * 1000)

  const updated = await prisma.partyApplication.update({
    where: { id: applicationId },
    data: {
      status: 'confirmed',
      startedAt,
      expiresAt,
    },
  })

  return { data: updated }
}

export async function adminRejectApplication(applicationId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const application = await tx.partyApplication.findUnique({
      where: { id: applicationId },
      select: { id: true, status: true, productId: true },
    })
    if (!application) {
      throw Object.assign(new Error('신청 내역을 찾을 수 없습니다.'), { statusCode: 404 })
    }
    if (application.status !== 'pending') {
      throw Object.assign(new Error('대기 중인 신청만 거절할 수 있습니다.'), { statusCode: 409 })
    }

    const updated = await tx.partyApplication.update({
      where: { id: applicationId },
      data: { status: 'cancelled' },
    })

    // 슬롯 원복 (음수 방지)
    await tx.ownProduct.updateMany({
      where: { id: application.productId, filledSlots: { gt: 0 } },
      data: { filledSlots: { decrement: 1 } },
    })

    return updated
  })

  return { data: result }
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
    return { data: { applied: false, applicationStatus: null } }
  }
  return {
    data: {
      applied: true,
      applicationStatus: application.status,
    },
  }
}
