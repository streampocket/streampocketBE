import type { OwnProductType, PartyApplicationStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { findOwnProductById } from '../../repositories/own/ownProductRepository'
import {
  findActiveApplication,
  findApplicationsByUserId,
  findApplicationsForAdmin,
  findApplicationDetailForAdmin,
  groupApplicationsByHour,
} from '../../repositories/own/partyApplicationRepository'
import { isPartyJoinable, calculateCurrentPrice } from '../../utils/partyPricing'
import { sendDiscordAlert } from '../../lib/discord'
import {
  sendPartyApplicationAlimtalk,
  type AlimtalkSendResult,
} from '../alimtalkService'
import { findDeliveryLogsByPartyApplicationId } from '../../repositories/deliveryLogRepository'
import { PARTY_APPLICATION_FEE } from '../../constants/fees'
import { PARTY_TYPE_LABEL } from '../../constants/party'
import { createPartyOrder, markOrderReturned } from '../steamOrderService'
import { findOrdersByPartyApplicationId } from '../../repositories/steamOrderRepository'
import { releasePartyMembership } from './partyMembershipService'
import { WITHDRAWN_USER_DISPLAY } from './userWithdrawalService'
import { refundApplicationPoint, usePointForApplication } from './pointService'

export async function applyToParty(productId: string, userId: string, usePoint = false) {
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
      // 이전 사이클에서 쓴 포인트를 먼저 되돌린다 — 안 그러면 재신청마다 이중으로 차감된다.
      // 반환액은 이력에서 계산하므로 이미 돌려준 건은 다시 돌려주지 않는다.
      await refundApplicationPoint(tx, {
        userId,
        applicationId: prior.id,
        reason: '재신청으로 이전 차감분 반환',
      })

      const usedPoint = usePoint
        ? (await usePointForApplication(tx, { userId, applicationId: prior.id, totalAmount }))
            .usedPoint
        : 0

      const updated = await tx.partyApplication.update({
        where: { id: prior.id },
        data: {
          status: 'pending',
          price: currentPrice,
          fee,
          totalAmount,
          usedPoint,
          startedAt: null,
          expiresAt: null,
        },
      })
      // 재신청 시 이전 사이클의 OTP 시크릿·소진 횟수가 새 사이클로 이월되지 않도록 삭제.
      // 발급 로그(PartyOtpIssueLog)는 이력으로 보존한다.
      await tx.partyOtpCredential.deleteMany({ where: { applicationId: prior.id } })
      return { applicationId: updated.id, usedPoint }
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

    // 이력에 applicationId를 남겨야 하므로 신청 생성 후에 차감한다.
    // 같은 트랜잭션이라 "신청은 생겼는데 포인트는 안 깎인" 상태가 남지 않는다.
    const usedPoint = usePoint
      ? (await usePointForApplication(tx, { userId, applicationId: created.id, totalAmount }))
          .usedPoint
      : 0
    if (usedPoint > 0) {
      await tx.partyApplication.update({ where: { id: created.id }, data: { usedPoint } })
    }
    return { applicationId: created.id, usedPoint }
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
      price: currentPrice,
      fee,
      totalAmount,
      usedPoint: result.usedPoint,
    })
  } else {
    alimtalkResult = { ok: false, reason: '수신 정보 없음' }
  }

  await notifyApplicationCreated({
    productName: product.name,
    categoryName: product.category.name,
    partyType: product.partyType,
    durationDays: product.durationDays,
    user,
    price: currentPrice,
    fee,
    totalAmount,
    usedPoint: result.usedPoint,
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
      usedPoint: result.usedPoint,
      // 실제로 낼 금액 — 화면 여러 곳이 같은 값을 쓰도록 서버가 계산해 내려준다
      payableAmount: totalAmount - result.usedPoint,
    },
  }
}

type NotifyInput = {
  productName: string
  categoryName: string
  partyType: OwnProductType
  durationDays: number
  user: { name: string | null; phone: string | null } | null
  price: number
  fee: number
  totalAmount: number
  usedPoint: number
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
    `파티: [${PARTY_TYPE_LABEL[input.partyType]}] ${input.productName} (${input.categoryName}) · ${input.durationDays}일`,
    `신청자: ${input.user?.name ?? '(알 수 없음)'} / ${input.user?.phone ?? '-'}`,
    `금액: ${input.price.toLocaleString()}원 + 수수료 ${input.fee.toLocaleString()}원 = ${input.totalAmount.toLocaleString()}원`,
    // 포인트를 쓴 건에만 붙인다 — 안 쓴 신청에 "-0P" 줄이 붙으면 읽는 데 방해만 된다
    ...(input.usedPoint > 0
      ? [
          `포인트: -${input.usedPoint.toLocaleString()}P → 결제 ${(input.totalAmount - input.usedPoint).toLocaleString()}원`,
        ]
      : []),
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
      // 완전 삭제(purge)된 회원의 신청은 익명 표시로 대체 — FE가 user.name/phone을 직접 참조
      items: items.map((item) => ({ ...item, user: item.user ?? WITHDRAWN_USER_DISPLAY })),
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

  return { data: { ...application, user: application.user ?? WITHDRAWN_USER_DISPLAY, alimtalkLogs } }
}

export async function adminApproveApplication(applicationId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const application = await tx.partyApplication.findUnique({
      where: { id: applicationId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            durationDays: true,
            totalSlots: true,
            filledSlots: true,
            durationMode: true,
          },
        },
        user: { select: { name: true } },
      },
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
      return { application: cancelled, autoRejected: true, partyClosed: false, productId: null }
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

    // 기간 차감형(countdown)만 파티 공유 시작 시각을 세팅.
    // 유지형(fixed)은 startedAt을 세팅하지 않아 카운트다운·가격하락 없이 각 참여자가 개별 기간(PartyApplication.expiresAt)을 그대로 보장받는다.
    if (application.product.durationMode === 'countdown') {
      // 첫 confirmed 승인 시점에만 파티 자체의 시작 시각을 세팅(startedAt이 null인 경우에만 update → 멱등).
      await tx.ownProduct.updateMany({
        where: { id: application.product.id, startedAt: null },
        data: { startedAt },
      })
    }

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

    // 슬롯 증가 직후 정원 충족 여부 재확인 (트랜잭션 내 재조회로 동시 승인에도 정확).
    // confirmed 인원(filledSlots)이 정원을 가득 채우면 모집완료(closed)로 자동 전환.
    const refreshed = await tx.ownProduct.findUnique({
      where: { id: application.product.id },
      select: { filledSlots: true, totalSlots: true, status: true, name: true, durationDays: true, partyType: true },
    })
    let partyClosed = false
    if (refreshed && refreshed.status === 'recruiting' && refreshed.filledSlots >= refreshed.totalSlots) {
      await tx.ownProduct.update({
        where: { id: application.product.id },
        data: { status: 'closed' },
      })
      partyClosed = true
    }

    return {
      application: confirmed,
      autoRejected: false,
      partyClosed,
      productId: application.product.id,
      product: refreshed,
      // 승인 성공 시 주문 자동 생성에 필요한 값(트랜잭션 밖에서 사용)
      orderInfo: {
        applicationId: application.id,
        partyName: application.product.name,
        durationDays: application.product.durationDays,
        receiverName: application.user?.name ?? '탈퇴한 회원',
      },
    }
  })

  if (result.partyClosed && result.product) {
    const { name, totalSlots, durationDays, partyType } = result.product
    sendDiscordAlert(
      'partyApply',
      `**파티 모집완료:** [${PARTY_TYPE_LABEL[partyType]}] "${name}" (${durationDays}일 / 정원 ${totalSlots}명) 파티가 정원을 모두 채워 모집완료 처리되었습니다.`,
    ).catch(() => {})
  }

  // 승인 성공(자동거절 아님) 시 주문관리에 파티 주문 자동 생성.
  // 트랜잭션 밖에서 수행 — 주문 생성 실패가 승인 자체를 롤백하지 않도록 하고, 실패 시 로그만 남긴다(주문은 수동 보정 가능).
  if (!result.autoRejected && result.orderInfo) {
    try {
      await createPartyOrder(result.orderInfo)
    } catch (error) {
      console.error('[party-approval] 파티 주문 자동 생성 실패', { applicationId, error })
    }
  }

  return {
    data: result.application,
    autoRejected: result.autoRejected,
    // 이번 승인으로 파티가 모집완료됐는지 — fe가 동일 파티 재생성 여부를 물을 때 사용
    partyClosed: result.partyClosed ?? false,
    productId: result.productId ?? null,
  }
}

export async function adminRejectApplication(applicationId: string) {
  // pending 상태에서는 슬롯을 점유하지 않으므로 슬롯 원복이 필요 없다.
  const application = await prisma.partyApplication.findUnique({
    where: { id: applicationId },
    select: { id: true, status: true, userId: true },
  })
  if (!application) {
    throw Object.assign(new Error('신청 내역을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (application.status !== 'pending') {
    throw Object.assign(new Error('대기 중인 신청만 거절할 수 있습니다.'), { statusCode: 409 })
  }

  // 결제가 이뤄지지 않았으므로 쓴 포인트를 돌려준다 (만료와 달리 서비스를 이용하지 않았다).
  // 탈퇴로 익명화된 신청(userId null)은 돌려줄 대상이 없다.
  if (application.userId) {
    await refundApplicationPoint(prisma, {
      userId: application.userId,
      applicationId,
      reason: '신청 거절로 반환',
    })
  }

  const updated = await prisma.partyApplication.update({
    where: { id: applicationId },
    data: { status: 'cancelled' },
  })

  return { data: updated }
}

/**
 * 확정 파티원 제거 (파티관리 화면) — 파티원을 빼고 연결된 파티 주문도 반품 처리한다.
 *
 * 파티원 제거가 주 책임이므로 제거 실패는 에러로 전파하고(404/409),
 * 주문 반품 실패는 건별로 격리해 실패 건수만 반환한다
 * (관리자는 주문관리에서 해당 주문을 반품하면 되고, 파티원 제거는 이미 확정된 상태라 중복되지 않는다).
 */
export async function adminCancelApplication(applicationId: string) {
  const release = await releasePartyMembership(applicationId)

  if (!release.released) {
    if (release.reason === 'not_found') {
      throw Object.assign(new Error('신청 내역을 찾을 수 없습니다.'), { statusCode: 404 })
    }
    throw Object.assign(
      new Error('확정(참여중)된 파티원만 제거할 수 있습니다.'),
      { statusCode: 409 },
    )
  }

  // 확정 파티원을 중도 제거하는 것이므로 쓴 포인트를 돌려준다.
  // (기간 만료로 끝난 건은 이 경로를 타지 않는다 — 정상 이용을 마쳤으므로 반환하지 않는다.)
  const cancelled = await prisma.partyApplication.findUnique({
    where: { id: applicationId },
    select: { userId: true },
  })
  if (cancelled?.userId) {
    await refundApplicationPoint(prisma, {
      userId: cancelled.userId,
      applicationId,
      reason: '파티원 제거로 반환',
    })
  }

  // 재신청→재승인으로 한 신청에 주문이 여러 건일 수 있어 미반품 주문을 모두 반품한다.
  const orders = await findOrdersByPartyApplicationId(applicationId, { excludeReturned: true })
  let orderReturned = 0
  let orderReturnFailed = 0

  for (const order of orders) {
    try {
      const changed = await markOrderReturned(order, {
        note: `└ 파티원 제거로 자동 반품 (${release.productName})`,
      })
      if (changed) orderReturned += 1
    } catch (error) {
      orderReturnFailed += 1
      const reason = error instanceof Error ? error.message : String(error)
      sendDiscordAlert(
        'error',
        `⚠️ 파티원 제거 — 연결 주문 반품 실패\n주문: ${order.productOrderId}\n파티: ${release.productName}\n사유: ${reason}\n주문관리에서 수동 반품이 필요합니다.`,
      ).catch(() => {})
    }
  }

  return {
    data: {
      productId: release.productId,
      productName: release.productName,
      userName: release.userName,
      filledSlots: release.filledSlotsAfter,
      totalSlots: release.totalSlots,
      partyReopened: release.partyReopened,
      orderReturned,
      orderReturnFailed,
    },
  }
}

export async function getMyApplications(userId: string) {
  const applications = await findApplicationsByUserId(userId)
  return {
    data: applications.map(({ otpCredential, ...rest }) => ({
      ...rest,
      otpRegistered: otpCredential != null,
      otpIssueCount: otpCredential?.issueCount ?? 0,
    })),
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

// ─────────────── 신청 시간대 통계 (관리자) ───────────────

const HOURS_IN_DAY = 24

export type ApplicationHourlyStats = {
  range: { from: string; to: string }
  total: number
  /** 가장 많이 들어온 시(0~23). 신청이 하나도 없으면 null */
  peakHour: number | null
  hourly: { hour: number; count: number }[]
}

/**
 * 이용자가 신청한 시각을 KST 시간대(0~23시)별로 집계한다.
 *
 * from/to는 'YYYY-MM-DD'. 경계는 +09:00을 명시해 KST 하루 전체를 덮는다 —
 * 오프셋을 빼면 UTC로 해석돼 9시간 밀린 구간을 세게 된다.
 */
export async function getApplicationHourlyStats(input: {
  from: string
  to: string
}): Promise<ApplicationHourlyStats> {
  const from = new Date(`${input.from}T00:00:00.000+09:00`)
  const to = new Date(`${input.to}T23:59:59.999+09:00`)

  const rows = await groupApplicationsByHour(from, to)
  const countByHour = new Map(rows.map((row) => [row.hour, row.count]))

  // 신청이 없는 시간대도 0으로 채운다 — 막대 자리가 있어야 분포가 읽힌다
  const hourly = Array.from({ length: HOURS_IN_DAY }, (_, hour) => ({
    hour,
    count: countByHour.get(hour) ?? 0,
  }))

  const total = hourly.reduce((sum, item) => sum + item.count, 0)
  const peak = total > 0 ? hourly.reduce((max, item) => (item.count > max.count ? item : max)) : null

  return {
    range: { from: input.from, to: input.to },
    total,
    peakHour: peak?.hour ?? null,
    hourly,
  }
}
