import 'express'
import type { AdminRole } from '@prisma/client'

declare module 'express' {
  // 단언 사유: declare module 병합은 interface만 가능 (type으로 대체 불가)
  interface Request {
    user?: {
      id: string
      email: string
    }
    // 관리자 API 전용 — authMiddleware가 요청마다 DB에서 조회해 채운다 (권한 회수 즉시 반영)
    admin?: {
      id: string
      email: string
      role: AdminRole
      permissions: string[]
    }
    gcoinBuyer?: {
      phone: string
    }
  }
}
