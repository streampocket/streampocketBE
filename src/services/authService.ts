import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { findAdminByEmail } from '../repositories/adminRepository'

type LoginInput = {
  email: string
  password: string
}

type LoginResult = {
  token: string
  admin: { id: string; email: string }
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

  const secret = process.env['JWT_SECRET']
  if (!secret) throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다.')

  const expiresIn = process.env['JWT_EXPIRES_IN'] ?? '7d'
  const token = jwt.sign({ id: admin.id, email: admin.email }, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  })

  return { token, admin: { id: admin.id, email: admin.email } }
}
