/**
 * Steam 친구추가 링크 자동 생성 서비스 (양식 B/A/C).
 * - 운영자가 입력한 자격증명을 주문에 연결된 SteamRegistration으로 upsert 저장(로그인 전).
 * - steam-session 로그인 → Quick Invite Link 2개 생성 → 주문 friendLink1/2에 저장.
 * - 실패 시 SteamOrderItem.errorMessage 기록 + Discord('error') 알림(자격증명·토큰 미포함).
 */
import {
  SteamRegistrationMatchStatus,
  SteamRegistrationStatus,
} from '@prisma/client'
import { findOrderById, updateOrderItem } from '../repositories/steamOrderRepository'
import {
  findRegistrationByOrderItemId,
  createRegistration,
  updateRegistration,
} from '../repositories/steamRegistrationRepository'
import {
  loginAndGetRefreshToken,
  startLoginSession,
  submitGuardCode,
  pollSession,
  createTwoQuickInvitesFromRefreshToken,
  type GuardOptions,
} from '../lib/steamClient'
import { putSession, getSession, deleteSession } from '../lib/steamSessionStore'
import { sendDiscordAlert } from '../lib/discord'

export type AuthType = 'guard_disabled' | 'backup_code' | 'guard_live'

export type AutoLinkCreds = {
  steamId: string
  steamPassword: string
  authType: AuthType
  backupCode?: string
}

type Links = { inviteLink1: string; inviteLink2: string }

export type AutoLinkResult =
  | ({ status: 'completed' } & Links)
  | { status: 'guard_required'; sessionId: string; guardOptions: GuardOptions }

export type PollResult = { status: 'pending' } | ({ status: 'completed' } & Links)

function variantFromAuthType(authType: AuthType): string {
  if (authType === 'guard_disabled') return 'B'
  if (authType === 'backup_code') return 'A'
  return 'C'
}

function describeAuth(authType: AuthType): string {
  if (authType === 'guard_disabled') return 'B(가드해제)'
  if (authType === 'backup_code') return 'A(백업코드)'
  return 'C(인증번호)'
}

function domainError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode })
}

/** 입력 자격증명을 주문 연결 SteamRegistration으로 upsert (로그인 시도 전에 저장) */
async function upsertCredentials(orderItemId: string, creds: AutoLinkCreds): Promise<void> {
  const formVariant = variantFromAuthType(creds.authType)
  const steamGuardDisabled = creds.authType === 'guard_disabled'
  const steamGuardCodes = creds.authType === 'backup_code' ? (creds.backupCode ?? null) : null

  const existing = await findRegistrationByOrderItemId(orderItemId)
  if (existing) {
    await updateRegistration(existing.id, {
      steamId: creds.steamId,
      steamPassword: creds.steamPassword,
      steamGuardCodes,
      steamGuardDisabled,
      formVariant,
      matchStatus: SteamRegistrationMatchStatus.manual_matched,
      status: SteamRegistrationStatus.completed,
    })
    return
  }
  await createRegistration({
    orderItemId,
    steamId: creds.steamId,
    steamPassword: creds.steamPassword,
    steamGuardCodes,
    steamGuardDisabled,
    formVariant,
    refundConsent: false,
    rawMessage: '수동 입력(운영자)',
    botUserKey: 'manual',
    missingFields: [],
    matchStatus: SteamRegistrationMatchStatus.manual_matched,
    status: SteamRegistrationStatus.completed,
  })
}

async function saveLinks(orderItemId: string, links: Links): Promise<void> {
  await updateOrderItem(orderItemId, {
    friendLink1: links.inviteLink1,
    friendLink2: links.inviteLink2,
  })
}

/** 라이브러리 원문 에러를 사용자용 메시지로 변환 (자격증명·토큰 미노출) */
function toUserError(err: unknown): Error {
  if (err instanceof Error && 'statusCode' in err) return err
  const raw = err instanceof Error ? err.message : String(err)
  if (raw.includes('RateLimitExceeded')) {
    return domainError(
      '요청이 많아 일시적으로 제한되었습니다(계정 잠금 가능성). 잠시 후 다시 시도하세요.',
      429,
    )
  }
  if (raw.includes('InvalidPassword')) {
    return domainError('스팀 아이디 또는 비밀번호가 올바르지 않습니다.', 400)
  }
  if (raw.includes('TwoFactorCodeMismatch') || raw.includes('InvalidLoginAuthCode')) {
    return domainError('인증번호가 올바르지 않습니다.', 400)
  }
  return domainError(`자동 친구링크 생성에 실패했습니다: ${raw}`, 502)
}

async function recordFailure(orderItemId: string, label: string, err: unknown): Promise<void> {
  const reason = err instanceof Error ? err.message : String(err)
  const order = await findOrderById(orderItemId)
  await updateOrderItem(orderItemId, { errorMessage: `[자동링크] ${reason}` })
  await sendDiscordAlert(
    'error',
    `⚠️ 자동 친구링크 생성 실패\n주문: ${order?.productOrderId ?? orderItemId}\n양식: ${label}\n사유: ${reason}`,
  )
}

/** 메인 진입점: 주문 id + 자격증명으로 친구링크 2개 생성 (양식별 분기) */
export async function autoGenerateFriendLinks(
  orderItemId: string,
  creds: AutoLinkCreds,
): Promise<AutoLinkResult> {
  const order = await findOrderById(orderItemId)
  if (!order) {
    throw domainError('주문을 찾을 수 없습니다.', 404)
  }
  if (creds.authType === 'backup_code' && !creds.backupCode?.trim()) {
    throw domainError('백업코드를 입력하세요.', 400)
  }

  // 로그인 실패해도 재입력이 필요 없도록 자격증명을 먼저 저장한다.
  await upsertCredentials(orderItemId, creds)

  try {
    if (creds.authType === 'guard_live') {
      const result = await startLoginSession({
        accountName: creds.steamId,
        password: creds.steamPassword,
      })
      if (result.status === 'completed') {
        const links = await createTwoQuickInvitesFromRefreshToken(result.refreshToken)
        await saveLinks(orderItemId, links)
        return { status: 'completed', ...links }
      }
      const sessionId = putSession(result.login, orderItemId)
      return { status: 'guard_required', sessionId, guardOptions: result.guardOptions }
    }

    // 양식 B/A: 동기 처리
    const steamGuardCode =
      creds.authType === 'backup_code' ? creds.backupCode : undefined
    const refreshToken = await loginAndGetRefreshToken({
      accountName: creds.steamId,
      password: creds.steamPassword,
      ...(steamGuardCode ? { steamGuardCode } : {}),
    })
    const links = await createTwoQuickInvitesFromRefreshToken(refreshToken)
    await saveLinks(orderItemId, links)
    return { status: 'completed', ...links }
  } catch (err) {
    await recordFailure(orderItemId, describeAuth(creds.authType), err)
    throw toUserError(err)
  }
}

/** 양식 C 코드 방식: 인증번호 제출 → 링크 2개 생성·저장 */
export async function submitGuardCodeAndGenerate(
  sessionId: string,
  code: string,
): Promise<{ status: 'completed' } & Links> {
  const stored = getSession(sessionId)
  if (!stored) {
    throw domainError('인증 세션이 만료되었습니다. 다시 시도하세요.', 410)
  }
  try {
    const refreshToken = await submitGuardCode(stored.login, code)
    const links = await createTwoQuickInvitesFromRefreshToken(refreshToken)
    await saveLinks(stored.orderItemId, links)
    deleteSession(sessionId)
    return { status: 'completed', ...links }
  } catch (err) {
    await recordFailure(stored.orderItemId, 'C(인증번호)', err)
    throw toUserError(err)
  }
}

/** 양식 C 승인 방식: 폰 승인 완료 폴링 → 완료 시 링크 2개 생성·저장 */
export async function pollGuardAndGenerate(sessionId: string): Promise<PollResult> {
  const stored = getSession(sessionId)
  if (!stored) {
    throw domainError('인증 세션이 만료되었습니다. 다시 시도하세요.', 410)
  }
  try {
    const poll = pollSession(stored.login)
    if (!poll.authenticated || !poll.refreshToken) {
      return { status: 'pending' }
    }
    const links = await createTwoQuickInvitesFromRefreshToken(poll.refreshToken)
    await saveLinks(stored.orderItemId, links)
    deleteSession(sessionId)
    return { status: 'completed', ...links }
  } catch (err) {
    deleteSession(sessionId)
    await recordFailure(stored.orderItemId, 'C(폰 승인)', err)
    throw toUserError(err)
  }
}
