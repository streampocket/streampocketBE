import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {
  findUserByEmail,
  findUserByPhone,
  createUser,
} from '../../repositories/own/userRepository'
import { isPhoneVerified } from './phoneVerificationService'

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

const BCRYPT_ROUNDS = 12

function getJwtConfig() {
  const secret = process.env.JWT_USER_SECRET
  if (!secret) throw new Error('JWT_USER_SECRET 환경변수가 설정되지 않았습니다.')
  const expiresIn = process.env.JWT_USER_EXPIRES_IN ?? '30d'
  return { secret, expiresIn }
}

export function signUserToken(payload: { id: string; email: string; temp?: boolean }): string {
  const { secret, expiresIn } = getJwtConfig()
  // 단언 사유: jwt.SignOptions['expiresIn']은 string을 허용하나 타입 추론이 안 됨
  return jwt.sign(payload, secret, {
    expiresIn: (payload.temp ? '15m' : expiresIn) as jwt.SignOptions['expiresIn'],
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

  const token = signUserToken({ id: user.id, email: user.email })

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

  const token = signUserToken({ id: user.id, email: user.email })

  return { token, user: { id: user.id, email: user.email, name: user.name } }
}
