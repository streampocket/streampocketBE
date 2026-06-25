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
import {
  sendPartyApplicationAlimtalk,
  type AlimtalkSendResult,
} from '../alimtalkService'
import { findDeliveryLogsByPartyApplicationId } from '../../repositories/deliveryLogRepository'
import { PARTY_APPLICATION_FEE } from '../../constants/fees'

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
  const fee = PARTY_APPLICATION_FEE
  const totalAmount = currentPrice + fee

  const result = await prisma.$transaction(async (tx) => {
    // 신청 가능 여부 재검증 (트랜잭션 내, race condition 안전망).
    // filledSlots는 이제 "승인된(confirmed) 인원 수"의 의미를 가지며,
    // 이 값이 totalSlots 미만일 때만 신규 신청을 받는다. pending 신청은 슬롯을 점유하지 않는다.
    const fresh = await tx.ownProduct.findFirst({
      where: {
        id: productId,
        status: 'recruiting',
        deletedAt: null,
        filledSlots: { lt: product.totalSlots },
      },
      select: { id: true },
    })
    if (!fresh) {
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, phone: true },
  })

  let alimtalkResult: AlimtalkSendResult
  if (user?.name && user?.phone) {
    alimtalkResult = await sendPartyApplicationAlimtalk({
      partyApplicationId: result.applicationId,
      recipientPhoneNumber: user.phone,
      recipientName: user.name,
      productName: product.name,
    })
  } else {
    alimtalkResult = { ok: false, reason: '수신 정보 없음' }
  }

  await notifyApplicationCreated({
    productName: product.name,
    categoryName: product.category.name,
    user,
    price: currentPrice,
    fee,
    totalAmount,
    alimtalkResult,
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
  user: { name: string | null; phone: string | null } | null
  price: number
  fee: number
  totalAmount: number
  alimtalkResult: AlimtalkSendResult
}

function formatAlimtalkLine(result: AlimtalkSendResult): string {
  if (result.ok) {
    return '알림톡: ✓ 발송완료'
  }
  if (result.reason === '수신 정보 없음') {
    return '알림톡: - 미발송 (수신 정보 없음)'
  }
  return `알림톡: ✗ 실패 (${result.reason})`
}

async function notifyApplicationCreated(input: NotifyInput): Promise<void> {
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
    `신청자: ${input.user?.name ?? '(알 수 없음)'} / ${input.user?.phone ?? '-'}`,
    `금액: ${input.price.toLocaleString()}원 + 수수료 ${input.fee.toLocaleString()}원 = ${input.totalAmount.toLocaleString()}원`,
    `신청일시: ${now} (KST)`,
    formatAlimtalkLine(input.alimtalkResult),
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

  const logs = await findDeliveryLogsByPartyApplicationId(applicationId)
  const alimtalkLogs = logs.map((log) => ({
    id: log.id,
    status: log.status,
    templateCode: log.templateCode,
    errorMessage: log.errorMessage,
    sentAt: log.sentAt,
    createdAt: log.createdAt,
  }))

  return { data: { ...application, alimtalkLogs } }
}

export async function adminApproveApplication(applicationId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const application = await tx.partyApplication.findUnique({
      where: { id: applicationId },
      include: { product: { select: { id: true, durationDays: true, totalSlots: true, filledSlots: true } } },
    })
    if (!application) {
      throw Object.assign(new Error('신청 내역을 찾을 수 없습니다.'), { statusCode: 404 })
    }
    if (application.status !== 'pending') {
      throw Object.assign(new Error('대기 중인 신청만 승인할 수 있습니다.'), { statusCode: 409 })
    }

    // 슬롯이 가득 차 있으면 자동 거절(cancelled) 처리.
    if (application.product.filledSlots >= application.product.totalSlots) {
      const cancelled = await tx.partyApplication.update({
        where: { id: applicationId },
        data: { status: 'cancelled' },
      })
      return { application: cancelled, autoRejected: true }
    }

    const startedAt = new Date()
    const expiresAt = new Date(startedAt.getTime() + application.product.durationDays * 24 * 60 * 60 * 1000)

    const confirmed = await tx.partyApplication.update({
      where: { id: applicationId },
      data: {
        status: 'confirmed',
        startedAt,
        expiresAt,
      },
    })

    // 첫 confirmed 승인 시점에만 파티 자체의 시작 시각을 세팅(startedAt이 null인 경우에만 update → 멱등).
    await tx.ownProduct.updateMany({
      where: { id: application.product.id, startedAt: null },
      data: { startedAt },
    })

    // 승인 시점에 슬롯 +1. 동시 승인 race를 막기 위해 filledSlots < totalSlots 가드를 updateMany 조건으로 사용.
    const slotUpdate = await tx.ownProduct.updateMany({
      where: {
        id: application.product.id,
        filledSlots: { lt: application.product.totalSlots },
      },
      data: { filledSlots: { increment: 1 } },
    })
    if (slotUpdate.count === 0) {
      // 동시 승인으로 슬롯이 가득 찬 경우: 트랜잭션 롤백을 위해 명시적으로 throw.
      throw Object.assign(new Error('승인 처리 중 슬롯이 가득 찼습니다. 다시 시도해주세요.'), { statusCode: 409 })
    }

    return { application: confirmed, autoRejected: false }
  })

  return { data: result.application, autoRejected: result.autoRejected }
}

export async function adminRejectApplication(applicationId: string) {
  // pending 상태에서는 슬롯을 점유하지 않으므로 슬롯 원복이 필요 없다.
  const application = await prisma.partyApplication.findUnique({
    where: { id: applicationId },
    select: { id: true, status: true },
  })
  if (!application) {
    throw Object.assign(new Error('신청 내역을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (application.status !== 'pending') {
    throw Object.assign(new Error('대기 중인 신청만 거절할 수 있습니다.'), { statusCode: 409 })
  }

  const updated = await prisma.partyApplication.update({
    where: { id: applicationId },
    data: { status: 'cancelled' },
  })

  return { data: updated }
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
