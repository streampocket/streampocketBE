import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { getAuthenticatedAdmin } from '../services/authService'
import type { AdminPermission } from '../constants/adminPermissions'

type JwtPayload = {
  id: string
  email: string
}

// 서명 검증 후 DB에서 관리자를 다시 조회한다 — 권한 회수·비활성화·삭제가 다음 요청부터 즉시 반영된다
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  let payload: JwtPayload
  try {
    // 단언 사유: jwt.verify 반환 타입이 string | JwtPayload이나 sign 시 객체로 전달하므로 객체 보장
    payload = jwt.verify(token, secret) as JwtPayload
  } catch {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' })
    return
  }

  try {
    const admin = await getAuthenticatedAdmin(payload.id)
    if (!admin) {
      res.status(401).json({ message: '사용할 수 없는 계정입니다. 다시 로그인해 주세요.' })
      return
    }
    req.user = { id: admin.id, email: admin.email }
    req.admin = admin
    next()
  } catch (err) {
    next(err)
  }
}

// 사장은 항상 통과, 직원은 keys 중 하나라도 권한이 있으면 통과 (여러 페이지가 같이 쓰는 API용 any-of)
export function requirePermission(...keys: AdminPermission[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const admin = req.admin
    if (!admin) {
      res.status(401).json({ message: '인증 토큰이 없습니다.' })
      return
    }
    if (admin.role === 'owner' || keys.some((key) => admin.permissions.includes(key))) {
      next()
      return
    }
    res.status(403).json({ message: '이 기능을 사용할 권한이 없습니다.' })
  }
}

// 체크박스와 무관한 사장 전용 기능 (설정·직원 관리·주문 삭제 등)
export function requireOwner(req: Request, res: Response, next: NextFunction): void {
  const admin = req.admin
  if (!admin) {
    res.status(401).json({ message: '인증 토큰이 없습니다.' })
    return
  }
  if (admin.role === 'owner') {
    next()
    return
  }
  res.status(403).json({ message: '사장 계정만 사용할 수 있는 기능입니다.' })
}
