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
