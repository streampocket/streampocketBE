import type { Request, Response } from 'express'
import { expireOldParties } from '../../services/own/ownProductService'

export async function expirePartiesHandler(_req: Request, res: Response): Promise<void> {
  const result = await expireOldParties()
  res.json({ message: '파티 만료 처리 완료', ...result })
}
