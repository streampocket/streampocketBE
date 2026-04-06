import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

type UserJwtPayload = {
  id: string
  email: string
  temp?: boolean
}

export function userAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: '인증 토큰이 없습니다.' })
    return
  }

  const token = authHeader.slice(7)
  const secret = process.env.JWT_USER_SECRET

  if (!secret) {
    res.status(500).json({ message: '서버 설정 오류' })
    return
  }

  try {
    // 단언 사유: jwt.verify 반환 타입이 string | JwtPayload이나 sign 시 객체로 전달하므로 객체 보장
    const payload = jwt.verify(token, secret) as UserJwtPayload
    if (payload.temp) {
      res.status(401).json({ message: '전화번호 인증이 필요합니다.' })
      return
    }
    req.user = { id: payload.id, email: payload.email }
    next()
  } catch {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' })
  }
}
