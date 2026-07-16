import type { Request, Response } from 'express'
import { purgeWithdrawnUsers } from '../../services/own/userWithdrawalService'

export async function purgeWithdrawnUsersHandler(_req: Request, res: Response): Promise<void> {
  const result = await purgeWithdrawnUsers()
  res.json({ message: '탈퇴 회원 완전 삭제 처리 완료', ...result })
}
