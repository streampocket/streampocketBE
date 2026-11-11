import { Request, Response } from 'express'
import { z } from 'zod'
import { login } from '../services/authService'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const body = loginSchema.parse(req.body)
  const result = await login(body)
  res.json({ data: result })
}

// 로그인한 관리자의 역할·권한 — fe가 메뉴·페이지 접근을 판단할 때 사용 (authMiddleware가 DB에서 조회한 값)
export async function getMeHandler(req: Request, res: Response): Promise<void> {
  res.json({ data: req.admin })
}
