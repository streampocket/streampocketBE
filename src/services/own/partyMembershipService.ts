/**
 * 파티원 제거 코어 — 확정(confirmed) 파티원을 취소 처리하고 모집 인원을 되돌린다.
 *
 * ⚠️ 이 파일은 **주문 도메인을 절대 import 하지 않는다**.
 * 반품↔파티원 제거는 양방향 연동이라, 코어끼리 서로를 호출하면 무한 루프가 된다.
 * 주문 반품은 호출자(steamOrderService.manualReturnOrder / partyApplicationService.adminCancelApplication)가 담당하며,
 * 이 코어는 파티 상태만 책임진다.
 */
import type { PartyApplicationStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { sendDiscordAlert } from '../../lib/discord'
import { PARTY_TYPE_LABEL } from '../../constants/party'
import { evaluatePartyReopen } from '../../utils/partyPricing'

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
    const cancelled = await tx.partyApplication.updateMany({
      where: { id: applicationId, status: 'confirmed' },
      data: { status: 'cancelled' },
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

    return { released: true, ...base, slotDecremented, filledSlotsAfter, partyReopened }
  })

  if (!result.released) return result

  // 알림은 트랜잭션 밖에서 best-effort (기존 승인·만료 알림과 동일 관행)
  const memberLabel = result.userName ?? '탈퇴한 회원'
  const slotLine = `${result.filledSlotsBefore}/${result.totalSlots} → ${result.filledSlotsAfter}/${result.totalSlots}`
  const stateLine = result.partyReopened
    ? '모집중으로 다시 전환되었습니다.'
    : '파티 상태는 유지됩니다.'
  sendDiscordAlert(
    'partyApply',
    `**파티원 제거:** [${result.partyTypeLabel}] "${result.productName}" — ${memberLabel} 님이 파티에서 제거되었습니다.\n인원: ${slotLine}\n${stateLine}`,
  ).catch(() => {})

  if (!result.slotDecremented) {
    sendDiscordAlert(
      'error',
      `⚠️ 파티원 제거 — 인원 감소 실패(이미 0)\n파티: ${result.productName}\n신청: ${applicationId}\n신청은 취소되었으나 모집 인원이 0이어서 감소하지 않았습니다. 데이터 확인이 필요합니다.`,
    ).catch(() => {})
  }

  return result
}

/** 알림·응답 문구용 요약 — 반품 디스코드 메시지에 한 줄로 덧붙인다. */
export function describeMembershipRelease(result: MembershipReleaseResult): string {
  if (result.released) {
    const member = result.userName ?? '탈퇴한 회원'
    const reopened = result.partyReopened ? ', 모집중 전환' : ''
    return `└ 파티원 제거: ${member} (${result.filledSlotsBefore}/${result.totalSlots} → ${result.filledSlotsAfter}/${result.totalSlots}${reopened})`
  }
  if (result.reason === 'not_found') {
    return '└ ⚠️ 연결된 파티 신청을 찾을 수 없어 파티원은 변동 없음'
  }
  return `└ ⚠️ 파티 신청이 확정 상태가 아니어서(${result.statusBefore}) 파티원 변동 없음`
}
