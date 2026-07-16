import { Request, Response } from 'express'
import { z } from 'zod'
import { findUserById } from '../../repositories/own/userRepository'
import { withdrawSelf } from '../../services/own/userWithdrawalService'

export async function getMeHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id
  if (!userId) {
    res.status(401).json({ message: '인증이 필요합니다.' })
    return
  }

  const user = await findUserById(userId)
  if (!user) {
    res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
    return
  }
  // 탈퇴 처리된 계정의 잔여 access token 방어
  if (user.deletedAt) {
    res.status(401).json({ message: '탈퇴 처리된 계정입니다.' })
    return
  }

  res.json({
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      provider: user.provider,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt,
    },
  })
}

// ───────────────────────── 회원 탈퇴 ─────────────────────────

const withdrawSchema = z
  .object({
    reason: z.enum(['price', 'low_usage', 'no_party', 'dissatisfied', 'other']),
    reasonDetail: z.string().trim().max(300).optional(),
  })
  .refine((body) => body.reason !== 'other' || (body.reasonDetail ?? '').trim().length > 0, {
    message: '기타 사유를 입력해주세요.',
    path: ['reasonDetail'],
  })

export async function withdrawMeHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id
  if (!userId) {
    res.status(401).json({ message: '인증이 필요합니다.' })
    return
  }

  const body = withdrawSchema.parse(req.body)
  const result = await withdrawSelf(userId, body.reason, body.reasonDetail)
  res.json({ message: '탈퇴가 완료되었습니다.', ...result })
}
