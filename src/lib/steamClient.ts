/**
 * Steam 자동 로그인 + 친구추가 링크(Quick Invite Link) 생성 저수준 어댑터.
 * (steam-session으로 로그인 → refreshToken 획득 → steam-user로 링크 생성)
 *
 * ⚠️ 운영/보안 주의:
 * - Steam 클라이언트를 흉내 내는 자동 로그인은 Steam 구독자 약관(SSA) 위반 소지가 있으며,
 *   낯선 IP(EC2 등)에서의 로그인은 계정 일시 잠금/추가 인증을 유발할 수 있다. 사용자 승인 하에 운영한다.
 * - 자격증명(비밀번호) / refreshToken / invite_link 토큰은 로그·Discord·errorMessage 본문에
 *   절대 출력하지 않는다.
 * - 프록시: 환경변수 STEAM_PROXY_URL 이 있으면 로그인 IP를 분산한다(현재 기본 EC2 직결).
 */
import {
  LoginSession,
  EAuthTokenPlatformType,
  EAuthSessionGuardType,
} from 'steam-session'
import SteamUser from 'steam-user'

type ProxyConfig = { httpProxy?: string }

function getProxyConfig(): ProxyConfig {
  const url = process.env['STEAM_PROXY_URL']
  return url ? { httpProxy: url } : {}
}

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err))
}

/** 양식 C에서 화면에 알려줄 가드 옵션 (코드 입력 / 폰 승인) */
export type GuardOptions = {
  codeType?: 'email' | 'device'
  confirmation: boolean
}

/** 양식 C 진행 중 로그인 세션 핸들 — 비동기 이벤트 결과를 보관한다. */
export type PendingLogin = {
  session: LoginSession
  refreshToken?: string
  error?: Error
}

export type StartLoginResult =
  | { status: 'completed'; refreshToken: string }
  | { status: 'guard_required'; login: PendingLogin; guardOptions: GuardOptions }

/** authenticated/error/timeout 이벤트를 Promise로 대기해 refreshToken을 반환 */
function waitForAuth(session: LoginSession): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (session.refreshToken) {
      resolve(session.refreshToken)
      return
    }
    const cleanup = (): void => {
      session.removeListener('authenticated', onAuth)
      session.removeListener('error', onErr)
      session.removeListener('timeout', onTimeout)
    }
    const onAuth = (): void => {
      cleanup()
      resolve(session.refreshToken)
    }
    const onErr = (err: unknown): void => {
      cleanup()
      reject(toError(err))
    }
    const onTimeout = (): void => {
      cleanup()
      reject(new Error('로그인 시간이 초과되었습니다. 다시 시도하세요.'))
    }
    session.on('authenticated', onAuth)
    session.on('error', onErr)
    session.on('timeout', onTimeout)
  })
}

/**
 * 양식 B(가드 해제) / A(백업코드): 동기적으로 refreshToken 획득.
 * - 양식 A는 steamGuardCode(백업코드 1개)를 함께 제출한다.
 * - 추가 인증이 필요한 상태면(가드가 실제로 켜져 있음 / 백업코드 무효) 에러를 던진다.
 */
export async function loginAndGetRefreshToken(input: {
  accountName: string
  password: string
  steamGuardCode?: string
}): Promise<string> {
  const session = new LoginSession(EAuthTokenPlatformType.SteamClient, getProxyConfig())
  // 인증 완료 후/중단 시 발생할 수 있는 'error' 이벤트가 핸들러 없이 던져지면
  // 프로세스가 죽으므로, 세션 수명 동안 무해한 핸들러를 항상 유지한다.
  session.on('error', () => {})
  const authPromise = waitForAuth(session)
  const resp = await session.startWithCredentials({
    accountName: input.accountName,
    password: input.password,
    ...(input.steamGuardCode ? { steamGuardCode: input.steamGuardCode } : {}),
  })
  if (resp.actionRequired) {
    authPromise.catch(() => {}) // 미사용 Promise의 미처리 거부 방지
    session.cancelLoginAttempt()
    throw new Error('추가 인증이 필요합니다. 인증 방식(가드 해제/백업코드)을 확인하세요.')
  }
  return authPromise
}

/**
 * 양식 C 1단계: 로그인 시작 후 가드 종류 판별.
 * - 가드가 필요 없으면 즉시 completed.
 * - 코드/승인 가드가 필요하면 PendingLogin과 guardOptions 반환(세션 유지).
 *   DeviceConfirmation(폰 승인)은 steam-session이 자동 폴링하며, 승인 시 authenticated 발생.
 */
export async function startLoginSession(input: {
  accountName: string
  password: string
}): Promise<StartLoginResult> {
  const session = new LoginSession(EAuthTokenPlatformType.SteamClient, getProxyConfig())
  const login: PendingLogin = { session }
  // 폰 승인(자동 폴링) 결과를 PendingLogin에 기록해 둔다.
  session.on('authenticated', () => {
    login.refreshToken = session.refreshToken
  })
  session.on('error', (err: unknown) => {
    login.error = toError(err)
  })
  session.on('timeout', () => {
    login.error = new Error('로그인 시간이 초과되었습니다. 다시 시도하세요.')
  })

  const resp = await session.startWithCredentials({
    accountName: input.accountName,
    password: input.password,
  })

  if (!resp.actionRequired) {
    const refreshToken = await waitForAuth(session)
    return { status: 'completed', refreshToken }
  }

  const actions = resp.validActions ?? []
  const hasEmailCode = actions.some((a) => a.type === EAuthSessionGuardType.EmailCode)
  const hasDeviceCode = actions.some((a) => a.type === EAuthSessionGuardType.DeviceCode)
  const confirmation = actions.some(
    (a) =>
      a.type === EAuthSessionGuardType.DeviceConfirmation ||
      a.type === EAuthSessionGuardType.EmailConfirmation,
  )
  const codeType: 'email' | 'device' | undefined = hasDeviceCode
    ? 'device'
    : hasEmailCode
      ? 'email'
      : undefined

  return { status: 'guard_required', login, guardOptions: { codeType, confirmation } }
}

/** 양식 C 코드 방식: 인증번호 제출 후 refreshToken 획득 */
export async function submitGuardCode(login: PendingLogin, code: string): Promise<string> {
  if (login.error) throw login.error
  await login.session.submitSteamGuardCode(code)
  return waitForAuth(login.session)
}

/** 양식 C 승인 방식: 폰 승인 완료 여부 폴링 */
export function pollSession(login: PendingLogin): {
  authenticated: boolean
  refreshToken?: string
} {
  if (login.error) throw login.error
  if (login.refreshToken) {
    return { authenticated: true, refreshToken: login.refreshToken }
  }
  return { authenticated: false }
}

/**
 * refreshToken으로 steam-user 로그인 후 Quick Invite Link 2개 + 친구 코드 획득.
 * 친구 코드 = steamID.accountid (스팀 계정번호) — 로그인된 세션에서 즉시 읽으므로 추가 호출 없음.
 * 'error' 이벤트는 핸들러가 없으면 프로세스가 죽으므로(EventEmitter 특성)
 * 함수 수명 동안 항상 리스너를 유지하고, 마지막에 logOff로 정리한다.
 */
export async function createTwoQuickInvitesFromRefreshToken(
  refreshToken: string,
): Promise<{ inviteLink1: string; inviteLink2: string; friendCode: string | null }> {
  const user = new SteamUser(getProxyConfig())
  // 로그인 단계에서 에러가 나면 로그인 Promise를 깨기 위한 핸들
  let rejectLogin: ((err: Error) => void) | null = null
  const onError = (err: Error): void => {
    const e = toError(err)
    if (rejectLogin) rejectLogin(e)
  }
  user.on('error', onError)
  try {
    await new Promise<void>((resolve, reject) => {
      rejectLogin = reject
      const onLoggedOn = (): void => {
        user.removeListener('loggedOn', onLoggedOn)
        resolve()
      }
      user.on('loggedOn', onLoggedOn)
      user.logOn({ refreshToken })
    })
    rejectLogin = null // 로그인 완료 후엔 createQuickInviteLink 자체 타임아웃에 위임
    // 친구 코드 — loggedOn 이후 steamID가 채워짐. 만약 비어 있어도 링크 생성은 막지 않는다.
    const friendCode = user.steamID ? String(user.steamID.accountid) : null
    const first = await user.createQuickInviteLink({ inviteLimit: 1 })
    const second = await user.createQuickInviteLink({ inviteLimit: 1 })
    return { inviteLink1: first.token.invite_link, inviteLink2: second.token.invite_link, friendCode }
  } finally {
    user.removeListener('error', onError)
    user.logOff()
  }
}
