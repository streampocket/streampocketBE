import { Request } from 'express'
import jwt from 'jsonwebtoken'

export type RequestUser = {
  id: string
  email: string
}

type UserJwtPayload = {
  id?: unknown
  email?: unknown
  temp?: unknown
}

// 요청에서 유저를 best-effort로 식별한다 (오류 알림 표시용).
// 인증 미들웨어를 타지 않는 공개 라우트에서도 Authorization 헤더가 있으면 검증해 식별하고,
// 토큰이 없거나 무효면 null을 반환한다 (호출부에서 "비회원" 처리). 절대 throw하지 않는다.
export function resolveRequestUser(req: Request): RequestUser | null {
  if (req.user) return req.user

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null

  const secret = process.env.JWT_USER_SECRET
  if (!secret) return null

  try {
    // 단언 사유: jwt.verify 반환 타입이 string | JwtPayload이나 sign 시 객체로 전달하므로 객체 보장
    const payload = jwt.verify(authHeader.slice(7), secret) as UserJwtPayload
    // temp 토큰(전화 인증 전)은 정식 유저가 아니므로 제외
    if (payload.temp === true) return null
    if (typeof payload.id !== 'string' || typeof payload.email !== 'string') return null
    return { id: payload.id, email: payload.email }
  } catch {
    return null
  }
}
