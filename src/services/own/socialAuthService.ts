import { AuthProvider, Prisma } from '@prisma/client'
import {
  findUserById,
  findActiveUserByPhone,
  createUserWithSocialAccount,
  findUserByEmail,
} from '../../repositories/own/userRepository'
import {
  findSocialAccount,
  createSocialAccount,
} from '../../repositories/own/userSocialAccountRepository'
import { createTermsAgreements } from '../../repositories/own/termsAgreementRepository'
import {
  signAccessToken,
  signRefreshToken,
  signSocialTempToken,
  verifySocialTempToken,
} from './userAuthService'
import { isPhoneVerified } from './phoneVerificationService'

// ───────────────────────── 소셜 로그인/가입 (전화번호 기반 계정 통합) ─────────────────────────
// 소셜 콜백에서 User를 선생성하지 않는다 — 전화인증 완료 시점에 기존 계정 연결 또는 신규 생성.
// 같은 번호 = 같은 회원: 어떤 로그인 방식이든 번호 소유가 알림톡 인증으로 증명되면 한 계정에 연결된다.

type SocialUser = { id: string; email: string; name: string }

type ResolveResult =
  | { kind: 'login'; token: string; refreshToken: string }
  | { kind: 'needPhone'; tempToken: string }

type CompleteResult = {
  token: string
  refreshToken: string
  user: SocialUser
  linked: boolean
  existingProvider: AuthProvider | null
}

function issueTokens(user: SocialUser): { token: string; refreshToken: string } {
  const token = signAccessToken({ id: user.id, email: user.email, name: user.name })
  const refreshToken = signRefreshToken({ id: user.id, email: user.email })
  return { token, refreshToken }
}

// OAuth 콜백 처리 — 연동 링크가 있으면 로그인, 없으면 전화인증 단계로 (temp 토큰에 소셜 정보만 운반)
export async function resolveSocialLogin(
  provider: 'kakao' | 'google',
  providerId: string,
  email: string,
  name: string | null,
): Promise<ResolveResult> {
  const link = await findSocialAccount(provider, providerId)
  if (link) {
    const user = await findUserById(link.userId)
    if (user && !user.deletedAt && user.phoneVerified) {
      return { kind: 'login', ...issueTokens(user) }
    }
    // 탈퇴 직후 잔존 링크 등 이례 케이스 — 신규 흐름으로 진행 (탈퇴 시 링크를 지우므로 정상적으론 미발생)
  }

  const tempToken = signSocialTempToken({ temp: true, provider, providerId, email, name })
  return { kind: 'needPhone', tempToken }
}

// 전화인증 완료 후 최종 처리 — 번호로 기존 계정을 찾아 연결하거나 신규 생성
export async function completeSocialSignup(input: {
  tempToken: string
  phone: string
  verificationId: string
}): Promise<CompleteResult> {
  const payload = verifySocialTempToken(input.tempToken)
  if (!payload) {
    throw Object.assign(
      new Error('로그인이 만료되었습니다. 소셜 로그인을 다시 시도해주세요.'),
      { statusCode: 400 },
    )
  }

  const phoneOk = await isPhoneVerified(input.verificationId, input.phone)
  if (!phoneOk) {
    throw Object.assign(new Error('전화번호 인증이 완료되지 않았습니다.'), { statusCode: 400 })
  }

  // 멱등 가드 — 이중 제출/재시도로 이미 링크가 생긴 경우 그 계정으로 로그인 응답
  const existingLink = await findSocialAccount(payload.provider, payload.providerId)
  if (existingLink) {
    const user = await findUserById(existingLink.userId)
    if (user && !user.deletedAt && user.phoneVerified) {
      return { ...issueTokens(user), user, linked: false, existingProvider: null }
    }
    throw Object.assign(new Error('처리할 수 없는 계정 상태입니다. 다시 시도해주세요.'), {
      statusCode: 400,
    })
  }

  const target = await findActiveUserByPhone(input.phone)
  if (target) {
    // ── 같은 번호의 기존 계정에 자동 연결 + 그 계정으로 로그인 ──
    try {
      await createSocialAccount({
        userId: target.id,
        provider: payload.provider,
        providerId: payload.providerId,
      })
    } catch (err) {
      // 동시 요청으로 링크가 먼저 생긴 경우 — 멱등 가드와 동일하게 로그인 처리
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        return { ...issueTokens(target), user: target, linked: false, existingProvider: null }
      }
      throw err
    }
    await createTermsAgreements(target.id, ['service', 'privacy'])
    return {
      ...issueTokens(target),
      user: target,
      linked: true,
      existingProvider: target.provider,
    }
  }

  // ── 신규 가입 ──
  // 소셜 email이 다른 활성 계정에서 사용 중이면 차단 — 번호가 다른데 email만 일치하는 자동 연결은
  // 소셜측 email 탈취 = 계정 탈취 벡터가 되므로 허용하지 않는다.
  const emailOwner = await findUserByEmail(payload.email)
  if (emailOwner && !emailOwner.deletedAt) {
    throw Object.assign(
      new Error(
        '이 소셜 계정의 이메일이 이미 다른 계정에서 사용 중입니다. 기존 계정으로 로그인 후 이용해주세요.',
      ),
      { statusCode: 409 },
    )
  }

  const user = await createUserWithSocialAccount({
    email: payload.email,
    name: payload.name ?? '사용자',
    phone: input.phone,
    phoneVerified: true,
    provider: payload.provider,
    socialProviderId: payload.providerId,
  })
  await createTermsAgreements(user.id, ['service', 'privacy'])

  return { ...issueTokens(user), user, linked: false, existingProvider: null }
}