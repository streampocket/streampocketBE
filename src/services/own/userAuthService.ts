import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Response } from 'express'
import {
  findUserByEmail,
  findUserByPhone,
  createUser,
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

export function signAccessToken(payload: { id: string; email: string; temp?: boolean }): string {
  const { secret, expiresIn } = getAccessJwtConfig()
  // 단언 사유: jwt.SignOptions['expiresIn']은 string을 허용하나 타입 추론이 안 됨
  return jwt.sign(payload, secret, {
    expiresIn: (payload.temp ? '15m' : expiresIn) as jwt.SignOptions['expiresIn'],
  })
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

export async function signup(input: SignupInput): Promise<AuthResult> {
  const phoneOk = await isPhoneVerified(input.verificationId, input.phone)
  if (!phoneOk) {
    throw Object.assign(new Error('전화번호 인증이 완료되지 않았습니다.'), { statusCode: 400 })
  }

  const existingEmail = await findUserByEmail(input.email)
  if (existingEmail) {
    throw Object.assign(new Error('이미 가입된 이메일입니다.'), { statusCode: 409 })
  }

  const existingPhone = await findUserByPhone(input.phone)
  if (existingPhone) {
    throw Object.assign(new Error('이미 등록된 전화번호입니다.'), { statusCode: 409 })
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

  const token = signAccessToken({ id: user.id, email: user.email })

  return { token, user: { id: user.id, email: user.email, name: user.name } }
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

  const token = signAccessToken({ id: user.id, email: user.email })

  return { token, user: { id: user.id, email: user.email, name: user.name } }
}
