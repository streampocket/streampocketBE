import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

type JwtPayload = {
  id: string
  email: string
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: '인증 토큰이 없습니다.' })
    return
  }

  const token = authHeader.slice(7)
  const secret = process.env.JWT_SECRET

  if (!secret) {
    res.status(500).json({ message: '서버 설정 오류' })
    return
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload
    req.user = { id: payload.id, email: payload.email }
    next()
  } catch {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' })
  }
}
