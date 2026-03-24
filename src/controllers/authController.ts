import { Request, Response } from 'express'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function login(req: Request, res: Response): Promise<void> {
  const body = loginSchema.parse(req.body)
  // TODO: authService.login(body) 구현
  void body
  res.status(501).json({ message: '미구현' })
}
