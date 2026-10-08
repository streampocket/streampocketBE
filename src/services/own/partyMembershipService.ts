/**
 * 파티원 제거 코어 — 확정(confirmed) 파티원을 취소 처리하고 모집 인원을 되돌린다.
 *
 * ⚠️ 이 파일은 **주문 도메인을 절대 import 하지 않는다**.
 * 반품↔파티원 제거는 양방향 연동이라, 코어끼리 서로를 호출하면 무한 루프가 된다.
 * 주문 반품은 호출자(steamOrderService.manualReturnOrder / partyApplicationService.adminCancelApplication)가 담당하며,
 * 이 코어는 파티 상태만 책임진다.
 */
import type { PartyApplicationStatus, Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { sendDiscordAlert } from '../../lib/discord'
import { PARTY_TYPE_LABEL } from '../../constants/party'
import { evaluatePartyReopen } from '../../utils/partyPricing'
import { kstMomentOf } from '../../utils/kstDate'
import { refundApplicationPoint } from './pointService'

type ReleaseBaseInfo = {
  statusBefore: PartyApplicationStatus
  productId: string
  productName: string
  partyTypeLabel: string
  userName: string | null
  filledSlotsBefore: number
  totalSlots: number
}

export type MembershipReleaseResult =
  // 신청 없음
  | { released: false; reason: 'not_found' }
  // 확정 상태가 아님 (이미 취소·만료·대기) — 아무것도 바꾸지 않음
  | ({ released: false; reason: 'not_confirmed' } & ReleaseBaseInfo)
  | ({ released: true } & ReleaseBaseInfo & {
        /** 인원이 실제로 줄었는지 — 이미 0이었다면 false(데이터 이상, 경고 발송) */
        slotDecremented: boolean
        filledSlotsAfter: number
        /** 모집완료 → 모집중으로 되돌렸는지 */
        partyReopened: boolean
        /** 자동 배정됐던 드라마 계정 자리를 회수했으면 그 계정 이메일 (배정 없었으면 null) */
        dramaSlotReleased: string | null
      })

/**
 * 확정 파티원을 제거한다 (신청 cancelled + 인원 -1 + 필요 시 모집중 복귀).
 * 세 쓰기를 한 트랜잭션으로 묶어 "인원만 줄고 신청은 그대로" 같은 불일치를 막는다.
 * 확정 상태가 아니면 아무것도 바꾸지 않고 released:false로 반환한다
 * (멱등 — 두 번 눌러도 인원이 두 번 줄지 않는다).
 */
export async function releasePartyMembership(
  applicationId: string,
): Promise<MembershipReleaseResult> {
  const result = await prisma.$transaction<MembershipReleaseResult>(async (tx) => {
    const application = await tx.partyApplication.findUnique({
      where: { id: applicationId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            status: true,
            deletedAt: true,
            filledSlots: true,
            totalSlots: true,
            startedAt: true,
            durationDays: true,
            partyType: true,
          },
        },
        user: { select: { name: true } },
        dramaAccount: { select: { email: true } },
      },
    })

    if (!application) {
      return { released: false, reason: 'not_found' }
    }

    const product = application.product
    const base: ReleaseBaseInfo = {
      statusBefore: application.status,
      productId: product.id,
      productName: product.name,
      partyTypeLabel: PARTY_TYPE_LABEL[product.partyType],
      userName: application.user?.name ?? null,
      filledSlotsBefore: product.filledSlots,
      totalSlots: product.totalSlots,
    }

    // 확정 상태일 때만 취소 — 동시 요청/재클릭 시 두 번째는 count 0으로 조용히 no-op
    // 이 코어를 지나는 해제 = 반품으로 기록(returnedAt) — 같은 카테고리 12시간 재신청 차단의 기준.
    // 거절(adminReject)은 이 코어를 지나지 않으므로 자연히 차단 대상에서 빠진다.
    const cancelled = await tx.partyApplication.updateMany({
      where: { id: applicationId, status: 'confirmed' },
      data: { status: 'cancelled', returnedAt: new Date() },
    })
    if (cancelled.count === 0) {
      return { released: false, reason: 'not_confirmed', ...base }
    }

    // 인원 -1 (음수 방지 가드 — 승인 시 `lt: totalSlots` 가드와 대칭)
    const slotUpdate = await tx.ownProduct.updateMany({
      where: { id: product.id, filledSlots: { gt: 0 } },
      data: { filledSlots: { decrement: 1 } },
    })
    const slotDecremented = slotUpdate.count > 0
    const filledSlotsAfter = slotDecremented ? product.filledSlots - 1 : product.filledSlots

    // 정원이 차서 닫혔던 파티라면 모집중으로 복귀 (근접 만료·수동 마감 파티는 제외)
    const partyReopened = evaluatePartyReopen(
      {
        status: product.status,
        deletedAt: product.deletedAt,
        filledSlots: product.filledSlots,
        totalSlots: product.totalSlots,
        startedAt: product.startedAt,
        durationDays: product.durationDays,
      },
      filledSlotsAfter,
    )
    if (partyReopened) {
      await tx.ownProduct.update({
        where: { id: product.id },
        data: { status: 'recruiting' },
      })
    }

    // 자동 배정됐던 드라마 계정 자리를 함께 비운다 — 안 비우면 재고가 유령으로 남는다.
    // deleteMany인 이유: 그 사이 관리자가 계정 메모를 통째 교체(replaceDramaAccount)해
    // 파티원 행이 이미 없을 수 있고, delete는 그때 예외를 던져 반품 전체를 롤백시킨다.
    let dramaSlotReleased: string | null = null
    if (application.dramaMemberId || application.dramaAccountId) {
      if (application.dramaMemberId) {
        await tx.dramaMember.deleteMany({ where: { id: application.dramaMemberId } })
      }
      if (application.dramaAccountId) {
        // 파티원(자식 행) 삭제는 계정(부모 행)의 updatedAt을 올리지 않아, 메모 편집기가 이를 모른다.
        // 그대로 저장하면 replaceDramaAccount가 메모 텍스트로 파티원을 재생성해
        // 방금 뺀 파티원이 되살아나고 자리를 계속 차지한다. 이 갱신이 그쪽 낙관적 잠금을 걸어 막는다.
        // (배정 쪽 dramaAssignmentService에도 같은 이유로 같은 갱신이 있다)
        //
        // 위 deleteMany와 같은 이유로 updateMany다 — 계정이 삭제됐으면(FK onDelete: SetNull)
        // update는 P2025로 반품 전체를 롤백시킨다. 계정이 없으면 지킬 자리도 없으니 그냥 넘어간다.
        await tx.dramaAccount.updateMany({
          where: { id: application.dramaAccountId },
          data: { updatedAt: new Date() },
        })
      }
      await tx.partyApplication.update({
        where: { id: applicationId },
        data: { dramaAccountId: null, dramaMemberId: null },
      })
      dramaSlotReleased = application.dramaAccount?.email ?? null
    }

    return { released: true, ...base, slotDecremented, filledSlotsAfter, partyReopened, dramaSlotReleased }
  })

  if (!result.released) return result

  // 알림은 트랜잭션 밖에서 best-effort (기존 승인·만료 알림과 동일 관행)
  const memberLabel = result.userName ?? '탈퇴한 회원'
  const slotLine = `${result.filledSlotsBefore}/${result.totalSlots} → ${result.filledSlotsAfter}/${result.totalSlots}`
  const stateLine = result.partyReopened
    ? '모집중으로 다시 전환되었습니다.'
    : '파티 상태는 유지됩니다.'
  const dramaLine = result.dramaSlotReleased
    ? `\n드라마 계정 자리 회수: ${result.dramaSlotReleased}`
    : ''
  sendDiscordAlert(
    'partyApply',
    `**파티원 제거:** [${result.partyTypeLabel}] "${result.productName}" — ${memberLabel} 님이 파티에서 제거되었습니다.\n인원: ${slotLine}\n${stateLine}${dramaLine}`,
  ).catch(() => {})

  if (!result.slotDecremented) {
    sendDiscordAlert(
      'error',
      `⚠️ 파티원 제거 — 인원 감소 실패(이미 0)\n파티: ${result.productName}\n신청: ${applicationId}\n신청은 취소되었으나 모집 인원이 0이어서 감소하지 않았습니다. 데이터 확인이 필요합니다.`,
    ).catch(() => {})
  }

  return result
}

// ── 재구매(기간 연장) — 연장 승인과 재구매 반품 되돌리기가 같이 쓴다 ─────────────────
// 이 파일에 두는 이유: 재구매 반품은 주문 반품(steamOrderService.manualReturnOrder)에서 호출되는데,
// 재구매 서비스는 승인 시 주문을 만들려고 주문 도메인을 import 한다. 되돌리기를 재구매 서비스에 두면
// 주문 ↔ 재구매가 서로를 import 하게 된다. 이 파일은 주문 도메인을 import 하지 않는다(파일 상단 규칙).

/**
 * 원 신청의 만료 시각이 바뀌면 연결된 드라마 파티원 메모의 만료(날짜·시각)도 맞춘다.
 * days(구매 일수)는 건드리지 않는다 — 메모의 "N일"은 파티 기간 표기이고, 늘어난 기간은 만료일로 드러난다.
 * 파티원 행이 없으면(배정 전 신청·수동 삭제) 아무것도 하지 않고 false.
 */
export async function syncDramaMemberExpiry(
  tx: Prisma.TransactionClient,
  input: { dramaMemberId: string | null; dramaAccountId: string | null; expiresAt: Date },
): Promise<boolean> {
  if (!input.dramaMemberId) return false
  const expiry = kstMomentOf(input.expiresAt)
  // deleteMany와 같은 이유로 updateMany — 관리자가 메모를 통째 교체해 행이 없어졌을 수 있다
  const updated = await tx.dramaMember.updateMany({
    where: { id: input.dramaMemberId },
    data: { endDate: expiry.date, startTime: expiry.hhmm },
  })
  if (updated.count > 0 && input.dramaAccountId) {
    // 자식 행 변경은 계정 updatedAt을 올리지 않는다 — 열려 있던 메모 편집기가 이 변경을 덮어쓰지 않게
    // 낙관적 잠금을 건다 (releasePartyMembership·배정과 같은 이유)
    await tx.dramaAccount.updateMany({
      where: { id: input.dramaAccountId },
      data: { updatedAt: new Date() },
    })
  }
  return updated.count > 0
}

export type RenewalRevertResult =
  | { reverted: false; reason: 'not_found' | 'not_confirmed' }
  | {
      reverted: true
      productName: string
      userName: string | null
      /** 되돌린 뒤 원 신청 만료 시각 */
      expiresAtAfter: Date | null
      refundedPoint: number
      memberSynced: boolean
    }

/**
 * 재구매 주문 반품 — 파티원은 그대로 두고 그 재구매로 늘어난 기간만 원 신청에서 뺀다.
 *
 * 빼기 방식인 이유: 재구매가 여러 번 쌓였을 때 "이 재구매 전 만료일"로 되돌리면 뒤에 승인된 재구매분까지
 * 날아간다. (extendedTo − extendedFrom)만큼만 빼면 해당 건만 정확히 빠진다.
 * 되돌린 만료가 이미 지났으면 다음 만료 크론이 정상 만료 처리한다.
 * 원 신청 returnedAt(12시간 재신청 차단)은 건드리지 않는다 — 기존 이용은 정상이었다.
 * 확정 상태가 아니면 아무것도 바꾸지 않는다(멱등 — 두 번 반품해도 두 번 빼지 않는다).
 */
export async function revertPartyRenewal(renewalId: string): Promise<RenewalRevertResult> {
  const result = await prisma.$transaction<RenewalRevertResult>(async (tx) => {
    const renewal = await tx.partyRenewal.findUnique({
      where: { id: renewalId },
      include: {
        application: {
          select: {
            id: true,
            userId: true,
            expiresAt: true,
            dramaMemberId: true,
            dramaAccountId: true,
            product: { select: { name: true } },
            user: { select: { name: true } },
          },
        },
      },
    })
    if (!renewal) return { reverted: false, reason: 'not_found' }

    // 확정 건만 — 동시 반품 시 두 번째는 count 0으로 조용히 끝난다
    const cancelled = await tx.partyRenewal.updateMany({
      where: { id: renewalId, status: 'confirmed' },
      data: { status: 'cancelled', returnedAt: new Date() },
    })
    if (cancelled.count === 0) return { reverted: false, reason: 'not_confirmed' }

    const application = renewal.application
    const extendedMs =
      renewal.extendedFrom && renewal.extendedTo
        ? renewal.extendedTo.getTime() - renewal.extendedFrom.getTime()
        : 0
    let expiresAtAfter = application.expiresAt
    let memberSynced = false
    if (application.expiresAt && extendedMs > 0) {
      expiresAtAfter = new Date(application.expiresAt.getTime() - extendedMs)
      await tx.partyApplication.update({
        where: { id: application.id },
        data: { expiresAt: expiresAtAfter },
      })
      memberSynced = await syncDramaMemberExpiry(tx, {
        dramaMemberId: application.dramaMemberId,
        dramaAccountId: application.dramaAccountId,
        expiresAt: expiresAtAfter,
      })
    }

    // 재구매에 쓴 포인트 반환 — 이력이 재구매 id로 남아 있어 원 신청 포인트와 섞이지 않는다
    const refunded = application.userId
      ? await refundApplicationPoint(tx, {
          userId: application.userId,
          applicationId: renewal.id,
          reason: '재구매 반품으로 반환',
        })
      : { refunded: 0 }

    return {
      reverted: true,
      productName: application.product.name,
      userName: application.user?.name ?? null,
      expiresAtAfter,
      refundedPoint: refunded.refunded,
      memberSynced,
    }
  })
  return result
}

/** 재구매 반품 결과 → 반품 디스코드 알림에 붙일 한 줄 */
export function describeRenewalRevert(result: RenewalRevertResult): string {
  if (!result.reverted) {
    return result.reason === 'not_found'
      ? '└ ⚠️ 연결된 재구매를 찾을 수 없어 기간 변동 없음'
      : '└ ⚠️ 재구매가 확정 상태가 아니어서 기간 변동 없음'
  }
  const member = result.userName ?? '탈퇴한 회원'
  const until = result.expiresAtAfter
    ? new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(result.expiresAtAfter)
    : '-'
  const point = result.refundedPoint > 0 ? `, 포인트 ${result.refundedPoint.toLocaleString()}P 반환` : ''
  return `└ 재구매 취소: ${member} — 파티원 유지, 만료 ${until}로 되돌림${point}`
}

/** 알림·응답 문구용 요약 — 반품 디스코드 메시지에 한 줄로 덧붙인다. */
export function describeMembershipRelease(result: MembershipReleaseResult): string {
  if (result.released) {
    const member = result.userName ?? '탈퇴한 회원'
    const reopened = result.partyReopened ? ', 모집중 전환' : ''
    const drama = result.dramaSlotReleased ? `\n└ 드라마 계정 자리 회수: ${result.dramaSlotReleased}` : ''
    return `└ 파티원 제거: ${member} (${result.filledSlotsBefore}/${result.totalSlots} → ${result.filledSlotsAfter}/${result.totalSlots}${reopened})${drama}`
  }
  if (result.reason === 'not_found') {
    return '└ ⚠️ 연결된 파티 신청을 찾을 수 없어 파티원은 변동 없음'
  }
  return `└ ⚠️ 파티 신청이 확정 상태가 아니어서(${result.statusBefore}) 파티원 변동 없음`
}
