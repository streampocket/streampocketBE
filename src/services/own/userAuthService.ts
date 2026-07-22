import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Response } from 'express'
import { AuthProvider } from '@prisma/client'
import {
  findUserByEmail,
  findActiveUserByPhone,
  createUser,
  updateUserCredentials,
} from '../../repositories/own/userRepository'
import { isPhoneVerified } from './phoneVerificationService'
import { createTermsAgreements } from '../../repositories/own/termsAgreementRepository'

type SignupInput = {
  name: string
  email: string
  password: string
  phone: string
  verificationId: string
}

type LoginInput = {
  email: string
  password: string
}

type AuthResult = {
  token: string
  user: { id: string; email: string; name: string }
}

// 가입 결과 — merged=true면 기존 소셜 계정에 이메일/비밀번호를 합친 것 (계정 통합)
type SignupResult = AuthResult & {
  merged: boolean
  previousProvider: AuthProvider | null
}

type RefreshPayload = {
  id: string
  email: string
  type: 'refresh'
}

const BCRYPT_ROUNDS = 12
const REFRESH_COOKIE_NAME = 'refreshToken'
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7일

function getAccessJwtConfig() {
  const secret = process.env.JWT_USER_SECRET
  if (!secret) throw new Error('JWT_USER_SECRET 환경변수가 설정되지 않았습니다.')
  const expiresIn = process.env.JWT_USER_EXPIRES_IN ?? '15m'
  return { secret, expiresIn }
}

function getRefreshJwtConfig() {
  const secret = process.env.JWT_USER_REFRESH_SECRET
  if (!secret) throw new Error('JWT_USER_REFRESH_SECRET 환경변수가 설정되지 않았습니다.')
  const expiresIn = process.env.JWT_USER_REFRESH_EXPIRES_IN ?? '7d'
  return { secret, expiresIn }
}

export function signAccessToken(payload: { id: string; email: string; name?: string; temp?: boolean }): string {
  const { secret, expiresIn } = getAccessJwtConfig()
  // 단언 사유: jwt.SignOptions['expiresIn']은 string을 허용하나 타입 추론이 안 됨
  return jwt.sign(payload, secret, {
    expiresIn: (payload.temp ? '15m' : expiresIn) as jwt.SignOptions['expiresIn'],
  })
}

// ── 소셜 가입 임시 토큰 (전화인증 전 단계 — User 행 없이 소셜 정보만 운반) ──

export type SocialTempPayload = {
  temp: true
  provider: 'kakao' | 'google'
  providerId: string
  email: string
  name: string | null
}

export function signSocialTempToken(payload: SocialTempPayload): string {
  const { secret } = getAccessJwtConfig()
  return jwt.sign(payload, secret, { expiresIn: '15m' })
}

// 검증 실패(만료/위조/구 포맷)는 null 반환 — 호출부가 400으로 변환
export function verifySocialTempToken(token: string): SocialTempPayload | null {
  const { secret } = getAccessJwtConfig()
  try {
    // 단언 사유: jwt.verify 반환 타입이 string | JwtPayload이나 sign 시 객체로 전달하므로 객체 보장
    const payload = jwt.verify(token, secret) as Partial<SocialTempPayload>
    if (
      payload.temp === true &&
      (payload.provider === 'kakao' || payload.provider === 'google') &&
      typeof payload.providerId === 'string' &&
      typeof payload.email === 'string'
    ) {
      return {
        temp: true,
        provider: payload.provider,
        providerId: payload.providerId,
        email: payload.email,
        name: typeof payload.name === 'string' ? payload.name : null,
      }
    }
    return null
  } catch {
    return null
  }
}

export function signRefreshToken(payload: { id: string; email: string }): string {
  const { secret, expiresIn } = getRefreshJwtConfig()
  const refreshPayload: RefreshPayload = { id: payload.id, email: payload.email, type: 'refresh' }
  // 단언 사유: jwt.SignOptions['expiresIn']은 string을 허용하나 타입 추론이 안 됨
  return jwt.sign(refreshPayload, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  })
}

export function verifyRefreshToken(token: string): { id: string; email: string } {
  const { secret } = getRefreshJwtConfig()
  // 단언 사유: jwt.verify 반환 타입이 string | JwtPayload이나 sign 시 객체로 전달하므로 객체 보장
  const payload = jwt.verify(token, secret) as RefreshPayload
  if (payload.type !== 'refresh') {
    throw new Error('유효하지 않은 리프레시 토큰입니다.')
  }
  return { id: payload.id, email: payload.email }
}

export function setRefreshCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/own/auth',
    maxAge: REFRESH_MAX_AGE_MS,
  })
}

export function clearRefreshCookie(res: Response): void {
  const isProd = process.env.NODE_ENV === 'production'
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/own/auth',
  })
}

export async function signup(input: SignupInput): Promise<SignupResult> {
  const phoneOk = await isPhoneVerified(input.verificationId, input.phone)
  if (!phoneOk) {
    throw Object.assign(new Error('전화번호 인증이 완료되지 않았습니다.'), { statusCode: 400 })
  }

  // ── 계정 통합: 같은 번호로 가입된 소셜 계정이 있으면 그 계정에 이메일/비밀번호를 합친다 ──
  const existingByPhone = await findActiveUserByPhone(input.phone)
  if (existingByPhone) {
    if (existingByPhone.password) {
      throw Object.assign(new Error('이미 이메일로 가입된 전화번호입니다. 로그인해주세요.'), {
        statusCode: 409,
      })
    }

    const emailOwner = await findUserByEmail(input.email)
    if (emailOwner && emailOwner.id !== existingByPhone.id) {
      throw Object.assign(new Error('이미 가입된 이메일입니다.'), { statusCode: 409 })
    }

    const hashedPassword = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
    const merged = await updateUserCredentials(existingByPhone.id, {
      email: input.email,
      password: hashedPassword,
      name: input.name,
    })
    await createTermsAgreements(merged.id, ['service', 'privacy'])

    const token = signAccessToken({ id: merged.id, email: merged.email, name: merged.name })
    return {
      token,
      user: { id: merged.id, email: merged.email, name: merged.name },
      merged: true,
      previousProvider: existingByPhone.provider,
    }
  }

  const existingEmail = await findUserByEmail(input.email)
  if (existingEmail) {
    throw Object.assign(new Error('이미 가입된 이메일입니다.'), { statusCode: 409 })
  }

  const hashedPassword = await bcrypt.hash(input.password, BCRYPT_ROUNDS)

  const user = await createUser({
    email: input.email,
    password: hashedPassword,
    name: input.name,
    phone: input.phone,
    phoneVerified: true,
    provider: 'local',
  })

  await createTermsAgreements(user.id, ['service', 'privacy'])

  const token = signAccessToken({ id: user.id, email: user.email, name: user.name })

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name },
    merged: false,
    previousProvider: null,
  }
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await findUserByEmail(input.email)
  if (!user || !user.password) {
    throw Object.assign(new Error('이메일 또는 비밀번호가 올바르지 않습니다.'), { statusCode: 401 })
  }

  const isValid = await bcrypt.compare(input.password, user.password)
  if (!isValid) {
    throw Object.assign(new Error('이메일 또는 비밀번호가 올바르지 않습니다.'), { statusCode: 401 })
  }

  if (!user.phoneVerified) {
    throw Object.assign(new Error('전화번호 인증이 필요합니다.'), { statusCode: 403 })
  }

  const token = signAccessToken({ id: user.id, email: user.email, name: user.name })

  return { token, user: { id: user.id, email: user.email, name: user.name } }
}
