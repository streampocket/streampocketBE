import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

type GcoinBuyerJwtPayload = {
  phone: string
  type: string
}

/** GCOIN 구매자 인증 — 휴대폰 인증으로 발급된 1시간 토큰 검증 */
export function gcoinAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: '휴대폰 인증이 필요합니다.' })
    return
  }

  const token = authHeader.slice(7)
  const secret = process.env.JWT_GCOIN_SECRET

  if (!secret) {
    res.status(500).json({ message: '서버 설정 오류' })
    return
  }

  try {
    // 단언 사유: jwt.verify 반환 타입이 string | JwtPayload이나 sign 시 객체로 전달하므로 객체 보장
    const payload = jwt.verify(token, secret) as GcoinBuyerJwtPayload
    if (payload.type !== 'gcoin_buyer' || !payload.phone) {
      res.status(401).json({ message: '유효하지 않은 토큰입니다.' })
      return
    }
    req.gcoinBuyer = { phone: payload.phone }
    next()
  } catch {
    res.status(401).json({ message: '인증이 만료되었습니다. 다시 인증해주세요.' })
  }
}
