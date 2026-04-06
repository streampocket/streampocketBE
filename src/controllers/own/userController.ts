import { Request, Response } from 'express'
import { findUserById } from '../../repositories/own/userRepository'

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
