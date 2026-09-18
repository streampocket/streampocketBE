/**
 * 파티 승인 시 드라마 계정 자동 배정.
 *
 * 하는 일: 조건에 맞는 계정 선택 → 그 계정의 파티원으로 등록 → 계정의 OTP 시크릿을 신청에 복사.
 * 계정 정보를 구매자에게 보내는 것은 관리자가 신청 관리에서 안내 양식을 복사해 직접 한다
 * (알림톡 자동 발송은 2026-09에 제거됨).
 *
 * "고르는 규칙"은 utils/dramaAssignment(순수 함수)에, 여기는 트랜잭션 orchestration만 둔다.
 */
// Prisma는 타입만이 아니라 값으로도 필요하다 — P2002(unique 위반) 판별에 instanceof를 쓴다
import { Prisma, type OwnProductType, type PartyDurationMode } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { sendDiscordAlert } from '../../lib/discord'
import { resolveDramaPlatforms } from '../../constants/dramaPlatform'
import { decryptSecret } from '../../lib/crypto'
import {
  countFreeSlots,
  isAssignable,
  matchAccountsBySecret,
  pickAssignableAccount,
} from '../../utils/dramaAssignment'
import { kstMomentOf, toDateString } from '../../utils/kstDate'
import { resolveApplicationExpiry } from '../../utils/partyPricing'
import {
  findAccountsForSecretLookup,
  findAssignCandidates,
  findDramaAccountById,
  findDramaAccountsByIds,
} from '../../repositories/own/dramaAccountRepository'
import { loadAccountMemo, toAccountMemo, type DramaAccountMemo } from './dramaAccountService'

/** 자동 배정이 불가능한 이유 — 화면에 그대로 사유로 표시된다 */
export type AssignFailReason =
  | 'not_found'
  | 'not_confirmed'
  | 'already_assigned'
  /** 동시에 배정한 다른 관리자가 먼저 커밋했다 — 데이터는 안전하고 이쪽만 실패로 끝난다 */
  | 'assigned_by_other'
  | 'already_has_secret'
  | 'unmapped_party'
  | 'no_account'
  /**
   * 관리자가 지정한 계정이 배정 직전 조건을 잃었다 — 마지막 자리가 채워진 경우가 대표적이다.
   * no_account와 구분하는 이유: 그쪽은 "조건에 맞는 계정이 아예 없다"이고 이쪽은
   * "고른 그 계정만 안 된다"라 화면 문구와 관리자의 다음 행동이 다르다.
   * 자동 선택으로 폴백하지 않는다 — 의도하지 않은 계정에 조용히 들어가는 것을 막는다.
   */
  | 'chosen_unavailable'

// 관리자 화면에 계정 자격증명을 평문으로 내려준다.
// 드라마 계정 관리(dramaAccountService.toView)와 같은 정책이며, 두 API 모두 authMiddleware
// (관리자 JWT) 뒤에 있고 유저 경로에서 재사용되지 않는다. 유저 응답에는 절대 실리면 안 된다.
export type AssignedAccountView = {
  id: string
  email: string
  password: string
  otpSecret: string
  platform: string | null
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
  /** 승인 시각 — 만료일을 다시 계산할 때 기준이 된다 */
  startedAt: true,
  expiresAt: true,
  dramaAccountId: true,
  user: { select: { name: true, phone: true } },
  product: {
    select: {
      name: true,
      durationDays: true,
      // 파티 타입: 개인형은 프라이빗(정원 1) 계정에만 배정한다
      partyType: true,
      // 차감형 만료일을 파티 종료일로 자르는 데 필요 (승인 로직과 같은 계산식을 쓰기 위함)
      durationMode: true,
      startedAt: true,
    },
  },
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

/** 후보를 고를 수 있는 상태일 때의 조회 조건 — 미리보기와 후보 목록이 공유한다 */
type PreviewContext = {
  platforms: readonly string[]
  expiresAt: Date
  partyType: OwnProductType
}

/**
 * 미리보기 단계의 가드 — `previewAssignment`와 `listAssignCandidates`가 **같은 규칙**을 쓰도록
 * 한 곳에 모았다(배정 실행 쪽은 findBlockingReason이 같은 역할을 한다).
 *
 * 두 API가 갈라지면 목록은 "고를 수 있다"고 보여주는데 승인은 막히는 어긋남이 생긴다.
 */
async function resolvePreviewContext(
  applicationId: string,
): Promise<{ ok: true; context: PreviewContext } | { ok: false; reason: AssignFailReason }> {
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

  return {
    ok: true,
    context: {
      platforms,
      expiresAt: assignmentExpiryOf(application),
      partyType: application.product.partyType,
    },
  }
}

/**
 * 배정 없이 후보만 확인한다 — 승인 모달이 토글을 켤 수 있는지 미리 판단하는 용도.
 * 확정 전(pending) 신청은 만료 시각이 아직 없으므로 "승인하면 언제 끝나는지"를 계산해 본다.
 */
export async function previewAssignment(applicationId: string): Promise<AssignResult> {
  const resolved = await resolvePreviewContext(applicationId)
  if (!resolved.ok) return resolved

  const { platforms, expiresAt, partyType } = resolved.context
  const picked = await findAccountFor(prisma, platforms, expiresAt, partyType)
  if (!picked) return { ok: false, reason: 'no_account' }

  return { ok: true, account: picked.view }
}

/** 관리자가 고를 수 있는 배정 후보 — 미리보기 계정과 같은 필드 + 판단에 필요한 메모 */
export type AssignCandidate = AssignedAccountView & {
  memo: DramaAccountMemo | null
  /** 지금 자동 배정이 고를 1건 — 화면의 기본 선택이 된다 */
  recommended: boolean
}

export type AssignCandidatesResult =
  | { ok: true; candidates: AssignCandidate[] }
  | { ok: false; reason: AssignFailReason }

/**
 * 조건에 맞는 배정 후보 **전건**.
 *
 * 자동 배정은 이 중 1건(pickAssignableAccount)만 쓰지만, 관리자가 다른 계정을 고르려면
 * 선택지가 다 보여야 한다. 정렬은 저장소 기본값(dueAt asc, email asc)을 그대로 두어
 * **자동 선택이 고를 계정이 항상 첫 번째**가 되게 한다 — 그래서 첫 항목이 recommended다.
 *
 * 메모(파티원 목록)를 함께 주는 이유: 관리자가 "누구와 같이 쓰게 되는지" 보고 고른다.
 * 계정마다 따로 조회하지 않고 findDramaAccountsByIds로 한 번에 읽는다.
 */
export async function listAssignCandidates(applicationId: string): Promise<AssignCandidatesResult> {
  const resolved = await resolvePreviewContext(applicationId)
  if (!resolved.ok) return resolved

  const { platforms, expiresAt, partyType } = resolved.context
  const now = kstMomentOf(new Date())
  const expiryDate = kstMomentOf(expiresAt).date
  const rows = await findAssignCandidates(prisma, { platforms, minDueAt: expiryDate, partyType })
  const eligible = rows.filter((account) =>
    isAssignable(account, { platforms, expiryDate, now, partyType }),
  )
  if (eligible.length === 0) return { ok: false, reason: 'no_account' }

  const memoByAccountId = new Map(
    (await findDramaAccountsByIds(eligible.map((account) => account.id))).map((account) => [
      account.id,
      toAccountMemo(account),
    ]),
  )

  return {
    ok: true,
    candidates: eligible.map((account, index) => ({
      ...toAssignedView(account, now),
      memo: memoByAccountId.get(account.id) ?? null,
      recommended: index === 0,
    })),
  }
}

/**
 * 계정이 버텨줘야 하는 기한 — "이 사람이 실제로 언제까지 쓰는가"다.
 *
 * 확정 건은 **저장된 expiresAt이 곧 진실**이다. 만료 크론(findExpiredApplications)·OTP 발급 가능
 * 판정·마이페이지 이용 기간이 전부 이 값만 보고, 파티 종료일이 지나도 회원을 끊는 코드는 없다.
 * 그래서 차감형 클램프 이전에 승인돼 파티 종료일을 넘는 값이 저장된 건이라도, 그 사람은 정말
 * 그날까지 쓴다 — 여기서 짧게 다시 계산하면 마감일이 그전에 오는 계정을 배정해
 * **이용 중에 계정이 먼저 죽는다.**
 *
 * 대기 건만 "지금 승인했다면" 기준으로 계산한다 (승인 로직과 같은 resolveApplicationExpiry라
 * 실제로 승인됐을 때 저장될 값과 일치한다 — 차감형이면 파티 종료일로 잘린 값).
 */
export type AssignmentExpiryInput = {
  expiresAt: Date | null
  product: { durationDays: number; durationMode: PartyDurationMode; startedAt: Date | null }
}

export function assignmentExpiryOf(application: AssignmentExpiryInput): Date {
  return (
    application.expiresAt ??
    resolveApplicationExpiry({
      approvedAt: new Date(),
      durationDays: application.product.durationDays,
      durationMode: application.product.durationMode,
      partyStartedAt: application.product.startedAt,
    })
  )
}

type CandidateRow = Awaited<ReturnType<typeof findAssignCandidates>>[number]

/**
 * 후보 계정 → 관리자 화면용 뷰.
 * 자동 선택·지정 선택·후보 목록 세 곳이 공유한다 — 따로 조립하면 화면끼리 필드가 어긋난다.
 */
function toAssignedView(account: CandidateRow, now: ReturnType<typeof kstMomentOf>): AssignedAccountView {
  return {
    id: account.id,
    email: account.email,
    password: decryptSecret(account.passwordEnc),
    otpSecret: decryptSecret(account.otpSecretEnc),
    platform: account.platform,
    dueAt: account.dueAt ? toDateString(account.dueAt) : null,
    freeSlots: countFreeSlots(account, now),
  }
}

/** 조건에 맞는 계정 1건 선택 (읽기 전용) */
async function findAccountFor(
  client: Prisma.TransactionClient | typeof prisma,
  platforms: readonly string[],
  expiresAt: Date,
  partyType: OwnProductType,
) {
  const now = kstMomentOf(new Date())
  const expiryDate = kstMomentOf(expiresAt).date
  const candidates = await findAssignCandidates(client, { platforms, minDueAt: expiryDate, partyType })
  const account = pickAssignableAccount(candidates, { platforms, expiryDate, now, partyType })
  if (!account) return null

  return { account, view: toAssignedView(account, now) }
}

/**
 * 관리자가 지정한 계정 1건 — **자동 선택과 같은 조건**으로 다시 검증한다.
 *
 * 후보 조회(findAssignCandidates)를 재사용하는 이유: 1차 조건(플랫폼·정원·마감일)을 따로 쓰면
 * 자동 선택과 어긋날 수 있다. 여기서 통과하면 이후 잠금·재확인 경로는 자동 선택과 완전히 같다.
 */
async function findChosenAccountFor(
  client: Prisma.TransactionClient | typeof prisma,
  accountId: string,
  platforms: readonly string[],
  expiresAt: Date,
  partyType: OwnProductType,
) {
  const now = kstMomentOf(new Date())
  const expiryDate = kstMomentOf(expiresAt).date
  const candidates = await findAssignCandidates(client, { platforms, minDueAt: expiryDate, partyType })
  const account = candidates.find((candidate) => candidate.id === accountId)
  if (!account || !isAssignable(account, { platforms, expiryDate, now, partyType })) return null

  return { account, view: toAssignedView(account, now) }
}

/**
 * 계정을 배정한다 — 파티원 등록 + OTP 시크릿 복사 + 신청에 링크 저장을 한 트랜잭션으로 묶는다.
 * 셋 중 하나만 되면 "자리는 먹었는데 OTP는 없는" 상태가 생기므로 전부 함께 커밋되어야 한다.
 *
 * `accountId`를 주면 그 계정만 배정한다(관리자가 승인 모달에서 고른 경우). 조건을 잃었으면
 * chosen_unavailable로 실패하고 **자동 선택으로 폴백하지 않는다** — 의도하지 않은 계정에
 * 조용히 들어가는 것보다 실패를 알리는 쪽이 낫다는 판단이다.
 * 주지 않으면 기존과 완전히 같은 자동 선택이다.
 */
export async function assignAccountToApplication(
  applicationId: string,
  options: { accountId?: string } = {},
): Promise<AssignResult> {
  try {
    return await runAssignTransaction(applicationId, options.accountId)
  } catch (error) {
    // 같은 신청을 동시에 배정하면 PartyOtpCredential.applicationId unique 제약에 걸린다.
    // 데이터는 이미 안전하고(한 건만 남는다) 상대가 배정을 끝낸 상태이므로,
    // 500 대신 사유로 돌려준다. already_assigned와 구분하는 이유는 화면 문구가 달라야 하기 때문 —
    // 이쪽은 "다른 관리자가 방금 가져갔으니 새로고침하라"는 안내가 필요하다.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { ok: false, reason: 'assigned_by_other' }
    }
    throw error
  }
}

function runAssignTransaction(applicationId: string, accountId?: string): Promise<AssignResult> {
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
    // 여기는 확정 건만 도달하므로(findBlockingReason이 not_confirmed로 거른다) 사실상 저장값이다.
    // 파티원 endDate도 이 값에서 나오므로, 실제 이용 종료일과 반드시 같아야 한다.
    const expiresAt = assignmentExpiryOf(application)
    // 지정 배정은 그 계정만 본다 — 조건을 잃었으면 다른 계정으로 갈아타지 않고 실패한다.
    const picked = accountId
      ? await findChosenAccountFor(tx, accountId, platforms, expiresAt, application.product.partyType)
      : await findAccountFor(tx, platforms, expiresAt, application.product.partyType)
    if (!picked) return { ok: false, reason: accountId ? 'chosen_unavailable' : 'no_account' }

    // 고른 계정 행에 쓰기 잠금을 잡는다. 어느 계정을 잠글지는 후보를 고른 뒤에야 알 수 있어
    // "고른다 → 잠근다 → 다시 확인한다 → 쓴다" 순서가 된다.
    // 여기부터 커밋까지 같은 계정을 노리는 다른 배정은 이 줄에서 대기한다.
    //
    // updatedAt이 함께 올라가는 것도 의도한 것이다 — 파티원(자식 행)을 넣어도 계정(부모 행)의
    // updatedAt은 오르지 않아, 메모 편집기를 열어둔 관리자가 저장하면 replaceDramaAccount가
    // 파티원을 전부 지우고 메모 텍스트로 재생성해 방금 넣은 파티원이 사라진다.
    // 이 갱신이 그쪽 낙관적 잠금을 걸어 409로 막아준다.
    await tx.dramaAccount.update({
      where: { id: picked.account.id },
      data: { updatedAt: new Date() },
    })

    // 잠금을 잡은 뒤 다시 센다 — 이제 이 수치가 확정값이다.
    // 잠금 전에 세면 상대의 미커밋 삽입이 보이지 않아(READ COMMITTED) 둘 다 통과할 수 있다.
    // capacity가 null(멤버십 미개설)이면 countFreeSlots가 0을 돌려주므로 같은 조건으로 걸러진다.
    const refreshed = await tx.dramaAccount.findUniqueOrThrow({
      where: { id: picked.account.id },
      select: { capacity: true, otpSecretEnc: true, members: { select: { endDate: true, startTime: true } } },
    })
    if (countFreeSlots(refreshed, kstMomentOf(new Date())) < 1) {
      throw Object.assign(
        new Error('배정 직전에 계정의 마지막 자리가 채워졌습니다. 다시 시도해주세요.'),
        { statusCode: 409 },
      )
    }

    // 만료 시각을 KST 날짜와 'HH:mm'으로 나눠 넣는다 — 메모 원문과 같은 표기가 되도록
    const expiry = kstMomentOf(expiresAt)
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

// ── 관리자 화면용 계정 자격증명 해석 ──────────────────────────────
// 신청 상세와 주문 OTP 탭이 같은 함수를 써서 두 화면이 어긋나지 않게 한다.

export type AccountCredentialSource =
  /** dramaAccountId 링크로 찾음 — 자동 배정 건 */
  | 'assigned'
  /** 시크릿 평문 역추적으로 찾음 — 관리자가 시크릿만 수동 등록한 건 */
  | 'matched_by_secret'
  /** 시크릿은 있으나 일치하는 계정을 찾지 못함 */
  | 'secret_only'

export type PartyAccountCredentials = {
  source: AccountCredentialSource
  accountId: string | null
  /**
   * 이 신청이 차지한 파티원 행 — 메모에서 "어느 줄이 이 신청인지" 강조하는 데 쓴다.
   * 수동 등록(역추적) 건은 링크가 없어 null이다.
   */
  memberId: string | null
  email: string | null
  password: string | null
  /** 신청에 등록된 시크릿 — 구매자가 실제로 발급받는 값 */
  otpSecret: string
  platform: string | null
  /** 'YYYY-MM-DD' */
  dueAt: string | null
  /**
   * 계정의 정원·정원 표기·메모 줄·파티원 목록 — 관리자 화면이 드라마 계정 관리와
   * 같은 메모 원문을 그리는 데 쓴다. 계정을 찾지 못한 secret_only면 null이다.
   */
  memo: DramaAccountMemo | null
  /**
   * 계정의 현재 시크릿과 신청 복사본이 다른가.
   * true면 구매자가 발급받는 코드가 실제 계정에서 통하지 않는다 —
   * 배정 후 관리자가 드라마 계정 메모에서 시크릿을 바꾸면 이렇게 갈라진다.
   */
  secretMismatch: boolean
  /** 같은 시크릿을 쓰는 계정이 여럿이라 어느 쪽인지 확정할 수 없다 */
  ambiguous: boolean
}

/** 배정된(또는 역추적한) 계정의 자격증명. 시크릿이 없으면 보여줄 것이 없어 null */
export async function resolveApplicationCredentials(
  applicationId: string,
): Promise<PartyAccountCredentials | null> {
  const application = await prisma.partyApplication.findUnique({
    where: { id: applicationId },
    select: {
      dramaAccountId: true,
      dramaMemberId: true,
      otpCredential: { select: { secretEnc: true } },
      // 계정 본체는 중첩 select로 읽지 않는다 — 메모(파티원·정원 표기·메모 줄)까지 필요해서
      // findDramaAccountById를 쓰는데, 그러면 이 select와 모양이 둘로 갈라진다.
      dramaAccount: { select: { id: true } },
    },
  })
  if (!application?.otpCredential) return null

  const otpSecret = decryptSecret(application.otpCredential.secretEnc)

  // 자동 배정 건 — 링크로 바로 찾으므로 전건 스캔이 필요 없다
  if (application.dramaAccount) {
    const linked = await findDramaAccountById(application.dramaAccount.id)
    if (linked) {
      return {
        source: 'assigned',
        accountId: linked.id,
        memberId: application.dramaMemberId,
        email: linked.email,
        password: decryptSecret(linked.passwordEnc),
        otpSecret,
        platform: linked.platform,
        dueAt: linked.dueAt ? toDateString(linked.dueAt) : null,
        // 계정의 현재 시크릿과 신청 복사본을 비교한다 (암호문이 아니라 평문끼리)
        secretMismatch: decryptSecret(linked.otpSecretEnc) !== otpSecret,
        ambiguous: false,
        memo: toAccountMemo(linked),
      }
    }
    // 링크를 읽은 직후 계정이 삭제된 경우 — 아래 역추적으로 떨어진다
  }

  // 수동 등록 건 — 시크릿 평문으로 계정을 되찾는다.
  // 암호문끼리는 비교할 수 없어(AES-GCM 랜덤 IV) 전건을 복호화해야 한다. 171건 수준이라 부담 없다.
  const accounts = await findAccountsForSecretLookup()
  const decrypted = accounts.map((a) => ({ ...a, otpSecret: decryptSecret(a.otpSecretEnc) }))
  const { account, ambiguous } = matchAccountsBySecret(decrypted, otpSecret)

  if (!account) {
    return {
      source: 'secret_only',
      accountId: null,
      memberId: null,
      email: null,
      password: null,
      otpSecret,
      platform: null,
      dueAt: null,
      secretMismatch: false,
      ambiguous: false,
      memo: null,
    }
  }

  return {
    source: 'matched_by_secret',
    accountId: account.id,
    // 역추적 건은 신청↔파티원 링크가 없다 (관리자가 시크릿만 손으로 등록한 건)
    memberId: null,
    email: account.email,
    password: decryptSecret(account.passwordEnc),
    otpSecret,
    platform: account.platform,
    dueAt: account.dueAt ? toDateString(account.dueAt) : null,
    // 시크릿이 같아서 찾은 계정이므로 정의상 어긋날 수 없다
    secretMismatch: false,
    ambiguous,
    // 역추적은 파티원을 포함하지 않는 최소 컬럼만 읽으므로 메모는 따로 조회한다
    memo: await loadAccountMemo(account.id),
  }
}

/**
 * 계정의 현재 OTP 시크릿을 신청 복사본에 다시 복사한다 (불일치 해소).
 * 발급 횟수는 유지한다 — 수동 재등록(adminSetPartyOtpSecret)과 같은 관행.
 */
export async function syncCredentialSecret(applicationId: string): Promise<{ secretMismatch: false }> {
  const application = await prisma.partyApplication.findUnique({
    where: { id: applicationId },
    select: {
      dramaAccount: { select: { otpSecretEnc: true } },
      otpCredential: { select: { id: true } },
    },
  })
  if (!application?.dramaAccount) {
    throw Object.assign(new Error('배정된 드라마 계정이 없어 동기화할 수 없습니다.'), { statusCode: 409 })
  }
  if (!application.otpCredential) {
    throw Object.assign(new Error('등록된 OTP 시크릿이 없습니다.'), { statusCode: 409 })
  }

  await prisma.partyOtpCredential.update({
    where: { applicationId },
    data: { secretEnc: application.dramaAccount.otpSecretEnc },
  })
  return { secretMismatch: false }
}

/**
 * 자동 배정 실패를 디스코드에 남긴다 — 승인 자체는 이미 끝났으므로 알림만 (best-effort).
 * 관리자는 주문 관리에서 재시도하거나 시크릿을 수동 등록해 보정한다.
 */
export function alertAutoAssignFailure(input: {
  applicationId: string
  productName: string
  userName: string | null
  reason: string | null
}): void {
  sendDiscordAlert(
    'partyApply',
    `⚠️ **파티 계정 자동 배정 실패**\n파티: ${input.productName}\n신청자: ${input.userName ?? '탈퇴한 회원'}\n사유: ${input.reason ?? '알 수 없음'}\n승인은 완료되었습니다 — 주문 관리에서 수동 처리해 주세요.`,
  ).catch(() => {})
}
