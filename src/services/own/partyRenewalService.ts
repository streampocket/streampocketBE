/**
 * 파티 재구매(기간 연장).
 *
 * 이용 중인 유지형 파티를 같은 자리·계정으로 이어 쓴다. 재구매 행(PartyRenewal)은 금액·할인·포인트·
 * 알림톡·주문의 근거만 담고, 서비스(계정·OTP·파티원)는 원 신청에 그대로 있다 — 승인하면 원 신청의
 * expiresAt만 늘어난다. 흐름은 일반 신청과 같다: 요청 → 알림톡(UJ_2053)·디스코드 → 관리자 승인/거절 →
 * 승인 시 파티 주문 자동 생성.
 *
 * 재구매 반품 되돌리기는 partyMembershipService.revertPartyRenewal에 있다(주문 ↔ 재구매 순환 import 방지).
 */
import { prisma } from '../../lib/prisma'
import { sendDiscordAlert } from '../../lib/discord'
import { PARTY_APPLICATION_FEE } from '../../constants/fees'
import { PARTY_TYPE_LABEL } from '../../constants/party'
import { formatKstDateTime } from '../../utils/kst'
import { resolveRenewalDiscount, resolveRenewalPeriod } from '../../utils/partyRenewal'
import {
  createRenewal,
  findApplicationForRenewal,
  findPendingRenewalByApplication,
  findRenewalDetailForAdmin,
} from '../../repositories/own/partyRenewalRepository'
import { findDeliveryLogsByPartyRenewalId } from '../../repositories/deliveryLogRepository'
import { getRenewalDiscountSettings } from '../systemSettingsService'
import { sendPartyApplicationAlimtalk, type AlimtalkSendResult } from '../alimtalkService'
import { createPartyOrder } from '../steamOrderService'
import { refundApplicationPoint, usePointForApplication } from './pointService'
import { syncDramaMemberExpiry } from './partyMembershipService'
import { WITHDRAWN_USER_DISPLAY } from './userWithdrawalService'

const httpError = (message: string, statusCode: number) =>
  Object.assign(new Error(message), { statusCode })

type RenewableApplication = NonNullable<Awaited<ReturnType<typeof findApplicationForRenewal>>>

/**
 * 재구매 가능 여부 — 견적과 요청이 같은 판정을 쓴다.
 * 이용 중(확정) + 유지형 + 파티 미삭제만. 차감형은 파티 전체가 한 시점에 끝나 이어 쓸 수 없다.
 */
function assertRenewable(application: RenewableApplication | null, userId: string): RenewableApplication {
  if (!application || application.userId !== userId) {
    throw httpError('신청 내역을 찾을 수 없습니다.', 404)
  }
  if (application.status !== 'confirmed') {
    throw httpError('이용 중인 파티만 재구매할 수 있습니다.', 409)
  }
  if (application.product.durationMode !== 'fixed') {
    throw httpError('기간 유지형 파티만 재구매할 수 있습니다.', 409)
  }
  if (application.product.deletedAt) {
    throw httpError('삭제된 파티는 재구매할 수 없습니다.', 409)
  }
  return application
}

// 유지형은 가격이 내려가지 않으므로 정가가 기준이다. 할인은 요청 시점에 확정한다.
async function priceRenewal(price: number) {
  const discount = resolveRenewalDiscount(await getRenewalDiscountSettings(), price)
  const fee = PARTY_APPLICATION_FEE
  return { price, discount, fee, totalAmount: price - discount + fee }
}

// ─────────────── 구매자 ───────────────

/** 마이페이지 재구매 확인 창 — 금액·할인·지금 승인되면 언제까지인지 */
export async function getRenewalQuote(applicationId: string, userId: string) {
  const application = assertRenewable(await findApplicationForRenewal(prisma, applicationId), userId)
  const pending = await findPendingRenewalByApplication(prisma, applicationId)
  const quote = await priceRenewal(application.product.price)
  const period = resolveRenewalPeriod(application.expiresAt, new Date(), application.product.durationDays)

  return {
    data: {
      ...quote,
      durationDays: application.product.durationDays,
      currentExpiresAt: application.expiresAt,
      // 이용 중 승인 기준 미리보기 — 실제 연장 시작은 승인 시각에 다시 계산한다
      expiresAtIfApproved: period.to,
      hasPendingRenewal: pending !== null,
    },
  }
}

export async function requestRenewal(applicationId: string, userId: string, usePoint = false) {
  const application = assertRenewable(await findApplicationForRenewal(prisma, applicationId), userId)
  const quote = await priceRenewal(application.product.price)

  const result = await prisma.$transaction(async (tx) => {
    // 트랜잭션 안에서 다시 확인 — 더블클릭으로 대기 재구매가 두 건 생기지 않게
    const pending = await findPendingRenewalByApplication(tx, applicationId)
    if (pending) {
      throw httpError('이미 재구매 요청이 승인 대기 중입니다.', 409)
    }
    const created = await createRenewal(tx, { applicationId, ...quote })

    // 포인트 이력에는 재구매 id를 남긴다 — 거절·반품 시 이 건만 정확히 돌려주기 위함
    const usedPoint = usePoint
      ? (await usePointForApplication(tx, { userId, applicationId: created.id, totalAmount: quote.totalAmount }))
          .usedPoint
      : 0
    if (usedPoint > 0) {
      await tx.partyRenewal.update({ where: { id: created.id }, data: { usedPoint } })
    }
    return { renewalId: created.id, usedPoint }
  })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, phone: true },
  })

  // 알림톡 템플릿(UJ_2053)은 심사가 필요해 문구를 못 바꾼다 — 재구매·할인 사실은 상품명 칸에 싣고,
  // 금액 칸에는 할인 적용가를 넣는다 (포인트 차감을 '총액'에 반영하는 것과 같은 방식)
  const productLabel =
    quote.discount > 0
      ? `${application.product.name} (재구매 ${quote.discount.toLocaleString('ko-KR')}원 할인)`
      : `${application.product.name} (재구매)`

  let alimtalkResult: AlimtalkSendResult
  if (user?.name && user?.phone) {
    alimtalkResult = await sendPartyApplicationAlimtalk({
      partyRenewalId: result.renewalId,
      recipientPhoneNumber: user.phone,
      recipientName: user.name,
      productName: productLabel,
      price: quote.price - quote.discount,
      fee: quote.fee,
      totalAmount: quote.totalAmount,
      usedPoint: result.usedPoint,
    })
  } else {
    alimtalkResult = { ok: false, reason: '수신 정보 없음' }
  }

  const alimtalkLine = alimtalkResult.ok
    ? '알림톡: ✓ 발송완료'
    : alimtalkResult.reason === '수신 정보 없음'
      ? '알림톡: - 미발송 (수신 정보 없음)'
      : `알림톡: ✗ 실패 (${alimtalkResult.reason})`
  const message = [
    '[파티 재구매 신청]',
    `파티: [${PARTY_TYPE_LABEL[application.product.partyType]}] ${application.product.name} (${application.product.category.name}) · ${application.product.durationDays}일 연장`,
    `신청자: ${user?.name ?? '(알 수 없음)'} / ${user?.phone ?? '-'}`,
    `현재 만료: ${application.expiresAt ? `${formatKstDateTime(application.expiresAt).slice(0, 16)} (KST)` : '-'}`,
    `금액: ${quote.price.toLocaleString()}원${quote.discount > 0 ? ` − 재구매 할인 ${quote.discount.toLocaleString()}원` : ''} + 수수료 ${quote.fee.toLocaleString()}원 = ${quote.totalAmount.toLocaleString()}원`,
    ...(result.usedPoint > 0
      ? [
          `포인트: -${result.usedPoint.toLocaleString()}P → 결제 ${(quote.totalAmount - result.usedPoint).toLocaleString()}원`,
        ]
      : []),
    `신청일시: ${formatKstDateTime().slice(0, 16)} (KST)`,
    alimtalkLine,
  ].join('\n')
  sendDiscordAlert('partyApply', message).catch((err) => {
    console.error('[partyRenewal] Discord 알림 실패:', err)
  })

  return {
    data: {
      renewalId: result.renewalId,
      ...quote,
      usedPoint: result.usedPoint,
      payableAmount: quote.totalAmount - result.usedPoint,
    },
  }
}

// ─────────────── 관리자 ───────────────

export async function adminGetRenewalDetail(renewalId: string) {
  const renewal = await findRenewalDetailForAdmin(renewalId)
  if (!renewal) throw httpError('재구매 내역을 찾을 수 없습니다.', 404)

  const logs = await findDeliveryLogsByPartyRenewalId(renewalId)
  const alimtalkLogs = logs.map((log) => ({
    id: log.id,
    status: log.status,
    templateCode: log.templateCode,
    errorMessage: log.errorMessage,
    sentAt: log.sentAt,
    createdAt: log.createdAt,
  }))

  const { application } = renewal
  // 대기 건은 "지금 승인하면 언제까지"를 미리 보여준다 — 승인과 같은 계산식(resolveRenewalPeriod)
  const preview =
    renewal.status === 'pending'
      ? resolveRenewalPeriod(application.expiresAt, new Date(), application.product.durationDays)
      : null
  const nextExpiresAt = preview?.to ?? renewal.extendedTo
  const accountDueAt = application.dramaAccount?.dueAt ?? null

  return {
    data: {
      kind: 'renewal' as const,
      id: renewal.id,
      applicationId: application.id,
      status: renewal.status,
      price: renewal.price,
      discount: renewal.discount,
      fee: renewal.fee,
      totalAmount: renewal.totalAmount,
      usedPoint: renewal.usedPoint,
      createdAt: renewal.createdAt,
      decidedAt: renewal.decidedAt,
      returnedAt: renewal.returnedAt,
      extendedFrom: renewal.extendedFrom ?? preview?.from ?? null,
      extendedTo: nextExpiresAt,
      user: application.user ?? WITHDRAWN_USER_DISPLAY,
      product: application.product,
      application: {
        status: application.status,
        startedAt: application.startedAt,
        expiresAt: application.expiresAt,
      },
      alimtalkLogs,
      warnings: {
        // 배정 계정의 멤버십 마감일이 연장 후 만료보다 빠르면 계정 멤버십을 늘려야 한다 (승인은 가능)
        accountDueBeforeExpiry:
          accountDueAt && nextExpiresAt && accountDueAt.getTime() < nextExpiresAt.getTime()
            ? { accountEmail: application.dramaAccount?.email ?? null, accountDueAt }
            : null,
        // 파티원 메모 연결이 없으면 만료일만 늘고 메모는 갱신되지 않는다 (배정 전 신청·수동 삭제)
        memberMissing: application.dramaMemberId === null,
      },
    },
  }
}

export async function adminApproveRenewal(renewalId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const renewal = await tx.partyRenewal.findUnique({
      where: { id: renewalId },
      include: {
        application: {
          select: {
            id: true,
            status: true,
            expiresAt: true,
            dramaMemberId: true,
            dramaAccountId: true,
            product: { select: { id: true, name: true, durationDays: true, partyType: true } },
            user: { select: { name: true } },
          },
        },
      },
    })
    if (!renewal) throw httpError('재구매 내역을 찾을 수 없습니다.', 404)
    if (renewal.status !== 'pending') throw httpError('대기 중인 재구매만 승인할 수 있습니다.', 409)

    const { application } = renewal
    // 만료(expired)까지는 이어 붙일 수 있다 — 이용 중 요청이 만료 후 승인되는 경우. 파티원 제거(cancelled)는 불가
    if (application.status !== 'confirmed' && application.status !== 'expired') {
      throw httpError('원 신청이 이용 중 또는 만료 상태가 아니어서 연장할 수 없습니다.', 409)
    }

    const approvedAt = new Date()
    const period = resolveRenewalPeriod(application.expiresAt, approvedAt, application.product.durationDays)

    // 대기 상태일 때만 확정 — 동시 승인 시 두 번째는 count 0
    const confirmed = await tx.partyRenewal.updateMany({
      where: { id: renewalId, status: 'pending' },
      data: {
        status: 'confirmed',
        extendedFrom: period.from,
        extendedTo: period.to,
        decidedAt: approvedAt,
      },
    })
    if (confirmed.count === 0) throw httpError('이미 처리된 재구매입니다.', 409)

    // 원 신청 연장 — 만료 크론이 이미 expired로 바꿨으면 이용 중으로 되돌린다
    // (만료 크론은 상태만 바꾸고 정원·파티원 행은 건드리지 않아, 상태 복구만으로 자리가 이어진다)
    await tx.partyApplication.update({
      where: { id: application.id },
      data: { expiresAt: period.to, status: 'confirmed' },
    })
    // 파티원이 전부 만료돼 파티 자체가 expired가 됐으면 다시 닫힘(closed)으로 — 모집은 열지 않는다
    await tx.ownProduct.updateMany({
      where: { id: application.product.id, status: 'expired' },
      data: { status: 'closed' },
    })
    // 새 기간을 산 것이므로 OTP 발급 횟수를 처음(3회)으로 — 시크릿(계정)은 그대로
    await tx.partyOtpCredential.updateMany({
      where: { applicationId: application.id },
      data: { issueCount: 0 },
    })
    const memberSynced = await syncDramaMemberExpiry(tx, {
      dramaMemberId: application.dramaMemberId,
      dramaAccountId: application.dramaAccountId,
      expiresAt: period.to,
    })

    return {
      applicationId: application.id,
      productName: application.product.name,
      partyType: application.product.partyType,
      durationDays: application.product.durationDays,
      receiverName: application.user?.name ?? '탈퇴한 회원',
      period,
      memberSynced,
    }
  })

  // 주문은 트랜잭션 밖 — 일반 승인과 같은 관행(주문 생성 실패가 승인을 롤백하지 않는다, 수동 보정 가능)
  try {
    await createPartyOrder({
      applicationId: result.applicationId,
      partyName: result.productName,
      durationDays: result.durationDays,
      receiverName: result.receiverName,
      partyRenewalId: renewalId,
    })
  } catch (error) {
    console.error('[party-renewal] 재구매 주문 자동 생성 실패', { renewalId, error })
  }

  const fmt = (date: Date) => formatKstDateTime(date).slice(0, 16)
  sendDiscordAlert(
    'partyApply',
    `**파티 재구매 승인:** [${PARTY_TYPE_LABEL[result.partyType]}] "${result.productName}" — ${result.receiverName} 님\n연장: ${fmt(result.period.from)} → ${fmt(result.period.to)} (KST)${result.memberSynced ? '' : '\n⚠️ 연결된 파티원 메모가 없어 드라마 계정 메모는 갱신하지 않았습니다.'}`,
  ).catch(() => {})

  return { data: { renewalId, extendedFrom: result.period.from, extendedTo: result.period.to } }
}

export async function adminRejectRenewal(renewalId: string) {
  const renewal = await prisma.partyRenewal.findUnique({
    where: { id: renewalId },
    select: { id: true, status: true, application: { select: { userId: true } } },
  })
  if (!renewal) throw httpError('재구매 내역을 찾을 수 없습니다.', 404)
  if (renewal.status !== 'pending') throw httpError('대기 중인 재구매만 거절할 수 있습니다.', 409)

  // 결제가 이뤄지지 않았으므로 이 재구매에 쓴 포인트만 돌려준다 (원 신청 포인트와 이력이 분리돼 있다)
  const userId = renewal.application.userId
  if (userId) {
    await refundApplicationPoint(prisma, {
      userId,
      applicationId: renewalId,
      reason: '재구매 거절로 반환',
    })
  }

  const updated = await prisma.partyRenewal.update({
    where: { id: renewalId },
    data: { status: 'cancelled', decidedAt: new Date() },
  })
  return { data: updated }
}
