import { Request, Response } from 'express'
import { z } from 'zod'
import { findUserById } from '../../repositories/own/userRepository'
import { findSocialAccountsByUserId } from '../../repositories/own/userSocialAccountRepository'
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

  // 사용 가능한 로그인 수단 — password 보유 시 이메일(local) + 연동된 소셜 목록 (중복 제거)
  const socialAccounts = await findSocialAccountsByUserId(user.id)
  const loginMethods = [
    ...(user.password ? ['local'] : []),
    ...socialAccounts.map((account) => account.provider),
  ].filter((method, index, arr) => arr.indexOf(method) === index)

  res.json({
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      provider: user.provider,
      loginMethods,
      phoneVerified: user.phoneVerified,
      // 헤더 드롭다운이 이 값을 쓴다. localStorage 캐시가 아니라 매번 여기서 읽어야
      // 리뷰 적립 직후에도 최신 잔액이 보인다.
      pointBalance: user.pointBalance,
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
