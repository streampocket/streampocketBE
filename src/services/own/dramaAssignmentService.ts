/**
 * 파티 승인 시 드라마 계정 자동 배정.
 *
 * 하는 일: 조건에 맞는 계정 선택 → 그 계정의 파티원으로 등록 → 계정의 OTP 시크릿을 신청에 복사
 * → 계정 아이디·비밀번호를 알림톡으로 발송.
 *
 * "고르는 규칙"은 utils/dramaAssignment(순수 함수)에, 여기는 트랜잭션·발송 orchestration만 둔다.
 */
import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { sendDiscordAlert } from '../../lib/discord'
import { resolveDramaPlatforms } from '../../constants/dramaPlatform'
import { countActiveMembers, countFreeSlots, pickAssignableAccount } from '../../utils/dramaAssignment'
import { kstMomentOf, toDateString } from '../../utils/kstDate'
import { findAssignCandidates } from '../../repositories/own/dramaAccountRepository'
import { sendPartyAccountAlimtalk } from '../alimtalkService'

/** 자동 배정이 불가능한 이유 — 화면에 그대로 사유로 표시된다 */
export type AssignFailReason =
  | 'not_found'
  | 'not_confirmed'
  | 'already_assigned'
  | 'already_has_secret'
  | 'unmapped_party'
  | 'no_account'

export type AssignedAccountView = {
  id: string
  email: string
  /** 'YYYY-MM-DD' */
  dueAt: string | null
  freeSlots: number
}

export type AssignResult =
  | { ok: true; account: AssignedAccountView }
  | { ok: false; reason: AssignFailReason }

/** 배정에 필요한 신청 정보 — 파티명(플랫폼 해석용)과 만료 시각이 핵심 */
const APPLICATION_FOR_ASSIGN = {
  id: true,
  status: true,
  expiresAt: true,
  dramaAccountId: true,
  user: { select: { name: true, phone: true } },
  product: { select: { name: true, durationDays: true } },
  otpCredential: { select: { id: true } },
} satisfies Prisma.PartyApplicationSelect

type ApplicationForAssign = Prisma.PartyApplicationGetPayload<{ select: typeof APPLICATION_FOR_ASSIGN }>

/** findBlockingReason이 실제로 보는 필드만 — 테스트가 전체 Prisma payload를 만들지 않아도 되게 좁힌다 */
export type AssignGuardInput = Pick<ApplicationForAssign, 'status' | 'expiresAt' | 'dramaAccountId'> & {
  otpCredential: { id: string } | null
  product: { name: string }
}

/**
 * 배정을 막는 사유를 찾는다 — 배정과 미리보기가 같은 규칙을 쓰도록 한 곳에 모았다.
 * 계정 후보 조회 이전 단계까지만 판정한다.
 */
export function findBlockingReason(application: AssignGuardInput | null): AssignFailReason | null {
  if (!application) return 'not_found'
  if (application.status !== 'confirmed' || !application.expiresAt) return 'not_confirmed'
  if (application.dramaAccountId) return 'already_assigned'
  // 관리자가 수동으로 시크릿만 등록해둔 건은 dramaAccountId가 비어 있어 "미배정"으로 보인다.
  // 이 가드가 없으면 자동 배정이 그 시크릿을 덮어쓰고 계정 자리까지 하나 더 먹는다.
  if (application.otpCredential) return 'already_has_secret'
  if (resolveDramaPlatforms(application.product.name).length === 0) return 'unmapped_party'
  return null
}

/**
 * 배정 없이 후보만 확인한다 — 승인 모달이 토글을 켤 수 있는지 미리 판단하는 용도.
 * 확정 전(pending) 신청은 만료 시각이 아직 없으므로 "승인하면 언제 끝나는지"를 계산해 본다.
 */
export async function previewAssignment(applicationId: string): Promise<AssignResult> {
  const application = await prisma.partyApplication.findUnique({
    where: { id: applicationId },
    select: APPLICATION_FOR_ASSIGN,
  })
  if (!application) return { ok: false, reason: 'not_found' }
  // 승인 대기(pending)와 확정(confirmed)만 미리보기 대상. 취소·만료 건에 후보를 보여주면
  // 화면은 "배정 가능"이라 하는데 실제 실행은 not_confirmed로 막히는 어긋남이 생긴다.
  if (application.status !== 'pending' && application.status !== 'confirmed') {
    return { ok: false, reason: 'not_confirmed' }
  }
  if (application.dramaAccountId) return { ok: false, reason: 'already_assigned' }
  if (application.otpCredential) return { ok: false, reason: 'already_has_secret' }

  const platforms = resolveDramaPlatforms(application.product.name)
  if (platforms.length === 0) return { ok: false, reason: 'unmapped_party' }

  // 아직 승인 전이면 "지금 승인했다면" 기준으로 만료 시각을 가정한다 (승인 로직과 같은 계산식)
  const expiresAt = application.expiresAt ?? expiryFromNow(application.product.durationDays)
  const picked = await findAccountFor(prisma, platforms, expiresAt)
  if (!picked) return { ok: false, reason: 'no_account' }

  return { ok: true, account: picked.view }
}

/** 승인 시각 + 이용일수 — adminApproveApplication의 계산식과 같아야 한다 */
function expiryFromNow(durationDays: number): Date {
  return new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
}

/** 조건에 맞는 계정 1건 선택 (읽기 전용) */
async function findAccountFor(
  client: Prisma.TransactionClient | typeof prisma,
  platforms: readonly string[],
  expiresAt: Date,
) {
  const now = kstMomentOf(new Date())
  const expiryDate = kstMomentOf(expiresAt).date
  const candidates = await findAssignCandidates(client, { platforms, minDueAt: expiryDate })
  const account = pickAssignableAccount(candidates, { platforms, expiryDate, now })
  if (!account) return null

  return {
    account,
    view: {
      id: account.id,
      email: account.email,
      dueAt: account.dueAt ? toDateString(account.dueAt) : null,
      freeSlots: countFreeSlots(account, now),
    } satisfies AssignedAccountView,
  }
}

/**
 * 계정을 배정한다 — 파티원 등록 + OTP 시크릿 복사 + 신청에 링크 저장을 한 트랜잭션으로 묶는다.
 * 셋 중 하나만 되면 "자리는 먹었는데 OTP는 없는" 상태가 생기므로 전부 함께 커밋되어야 한다.
 */
export async function assignAccountToApplication(applicationId: string): Promise<AssignResult> {
  return prisma.$transaction(async (tx) => {
    const application = await tx.partyApplication.findUnique({
      where: { id: applicationId },
      select: APPLICATION_FOR_ASSIGN,
    })
    const blocked = findBlockingReason(application)
    if (blocked || !application || !application.expiresAt) {
      return { ok: false, reason: blocked ?? 'not_found' }
    }

    const platforms = resolveDramaPlatforms(application.product.name)
    const picked = await findAccountFor(tx, platforms, application.expiresAt)
    if (!picked) return { ok: false, reason: 'no_account' }

    // 만료 시각을 KST 날짜와 'HH:mm'으로 나눠 넣는다 — 메모 원문과 같은 표기가 되도록
    const expiry = kstMomentOf(application.expiresAt)
    const member = await tx.dramaMember.create({
      data: {
        accountId: picked.account.id,
        site: '스트림포켓',
        siteSpaced: true,
        name: application.user?.name ?? '탈퇴한 회원',
        endDate: expiry.date,
        startTime: expiry.hhmm,
        days: application.product.durationDays,
        suffix: null,
      },
      select: { id: true },
    })

    // 정원 재검증 — 빈자리는 카운트 기반이라 조건부 updateMany 같은 원자 가드를 걸 수 없다.
    // 방금 넣은 행까지 포함해 다시 세고, 정원을 넘겼으면 throw해서 트랜잭션째 되돌린다.
    // (동시 승인 두 건이 같은 마지막 자리를 노렸을 때 뒤늦은 쪽이 여기서 걸린다)
    const refreshed = await tx.dramaAccount.findUniqueOrThrow({
      where: { id: picked.account.id },
      select: { capacity: true, otpSecretEnc: true, members: { select: { endDate: true, startTime: true } } },
    })
    const active = countActiveMembers(refreshed.members, kstMomentOf(new Date()))
    if (refreshed.capacity == null || active > refreshed.capacity) {
      throw Object.assign(new Error('배정 중 계정 정원이 가득 찼습니다. 다시 시도해주세요.'), {
        statusCode: 409,
      })
    }
    // OTP 시크릿은 암호문을 그대로 복사한다 — DramaAccount.otpSecretEnc와
    // PartyOtpCredential.secretEnc는 같은 키(OTP_SECRET_ENC_KEY)로 만든 encryptSecret 산출물이라
    // 복호화·재암호화가 필요 없다.
    // upsert가 아니라 create인 이유: already_has_secret 가드로 기존 행이 없음이 보장되므로,
    // 관리자가 수동 등록한 시크릿을 덮어쓰는 경로를 코드에서 아예 없앤다.
    await tx.partyOtpCredential.create({
      data: { applicationId, secretEnc: refreshed.otpSecretEnc },
    })

    await tx.partyApplication.update({
      where: { id: applicationId },
      data: { dramaAccountId: picked.account.id, dramaMemberId: member.id },
    })

    return { ok: true, account: picked.view }
  })
}

export type DeliverResult = {
  assigned: boolean
  sent: boolean
  account: AssignedAccountView | null
  reason: string | null
}

/**
 * 배정 + 알림톡 발송 — 승인 시점과 재시도 버튼이 함께 쓰는 단일 진입점.
 * 이미 배정된 건이면 배정은 건너뛰고 발송만 다시 시도한다.
 */
export async function assignAndDeliver(applicationId: string): Promise<DeliverResult> {
  const assign = await assignAccountToApplication(applicationId)

  // 이미 배정된 건은 발송만 재시도한다 (알림톡이 실패해 남은 경우)
  if (!assign.ok && assign.reason !== 'already_assigned') {
    return { assigned: false, sent: false, account: null, reason: assign.reason }
  }

  const application = await prisma.partyApplication.findUnique({
    where: { id: applicationId },
    select: {
      expiresAt: true,
      user: { select: { name: true, phone: true } },
      dramaAccount: { select: { id: true, email: true, passwordEnc: true, dueAt: true } },
    },
  })
  const account = application?.dramaAccount
  if (!application?.expiresAt || !account) {
    return { assigned: assign.ok, sent: false, account: null, reason: 'no_account' }
  }

  const view: AssignedAccountView = assign.ok
    ? assign.account
    : { id: account.id, email: account.email, dueAt: account.dueAt ? toDateString(account.dueAt) : null, freeSlots: 0 }

  if (!application.user?.phone) {
    return { assigned: assign.ok, sent: false, account: view, reason: '수신번호 없음' }
  }

  const sendResult = await sendPartyAccountAlimtalk({
    partyApplicationId: applicationId,
    recipientPhoneNumber: application.user.phone,
    recipientName: application.user.name,
    expiresAt: application.expiresAt,
    accountEmail: account.email,
    accountPasswordEnc: account.passwordEnc,
  })

  return {
    assigned: assign.ok,
    sent: sendResult.ok,
    account: view,
    reason: sendResult.ok ? null : sendResult.reason,
  }
}

/** 자동 배정·발송 실패를 디스코드에 남긴다 — 승인 자체는 이미 끝났으므로 알림만 (best-effort) */
export function alertAutoDeliverFailure(input: {
  applicationId: string
  productName: string
  userName: string | null
  result: DeliverResult
}): void {
  const stage = input.result.assigned ? '알림톡 발송' : '계정 배정'
  sendDiscordAlert(
    'partyApply',
    `⚠️ **파티 자동발송 실패 (${stage})**\n파티: ${input.productName}\n신청자: ${input.userName ?? '탈퇴한 회원'}\n사유: ${input.result.reason ?? '알 수 없음'}\n승인은 완료되었습니다 — 주문 관리에서 수동 처리해 주세요.`,
  ).catch(() => {})
}
