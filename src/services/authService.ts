import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AdminRole } from '@prisma/client'
import { findAdminByEmail, findAdminById } from '../repositories/adminRepository'

type LoginInput = {
  email: string
  password: string
}

type LoginResult = {
  token: string
  admin: { id: string; email: string }
}

export type AuthenticatedAdmin = {
  id: string
  email: string
  role: AdminRole
  permissions: string[]
}

export async function login(input: LoginInput): Promise<LoginResult> {
  const admin = await findAdminByEmail(input.email)
  if (!admin) {
    throw Object.assign(new Error('이메일 또는 비밀번호가 올바르지 않습니다.'), { statusCode: 401 })
  }

  const isValid = await bcrypt.compare(input.password, admin.password)
  if (!isValid) {
    throw Object.assign(new Error('이메일 또는 비밀번호가 올바르지 않습니다.'), { statusCode: 401 })
  }

  // 비밀번호 확인 뒤에 판정 — 틀린 비밀번호로 계정 상태를 알아낼 수 없게
  if (!admin.isActive) {
    throw Object.assign(new Error('비활성화된 계정입니다. 관리자에게 문의하세요.'), { statusCode: 403 })
  }

  const secret = process.env['JWT_SECRET']
  if (!secret) throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다.')

  const expiresIn = process.env['JWT_EXPIRES_IN'] ?? '7d'
  const token = jwt.sign({ id: admin.id, email: admin.email }, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  })

  return { token, admin: { id: admin.id, email: admin.email } }
}

// authMiddleware용 — 삭제·비활성 계정이면 null (요청 차단)
export async function getAuthenticatedAdmin(id: string): Promise<AuthenticatedAdmin | null> {
  const admin = await findAdminById(id)
  if (!admin || !admin.isActive) return null
  return {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    permissions: admin.role === 'owner' ? [] : admin.permissions,
  }
}
