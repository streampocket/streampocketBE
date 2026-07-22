import { prisma } from '../../lib/prisma'
import { AuthProvider } from '@prisma/client'

// 소셜 로그인 수단 연동 테이블 — 소셜 매칭의 단일 진실 원천 (User.providerId는 레거시)

export async function findSocialAccount(provider: AuthProvider, providerId: string) {
  return prisma.userSocialAccount.findUnique({
    where: { provider_providerId: { provider, providerId } },
  })
}

export async function findSocialAccountsByUserId(userId: string) {
  return prisma.userSocialAccount.findMany({
    where: { userId },
    select: { provider: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createSocialAccount(input: {
  userId: string
  provider: AuthProvider
  providerId: string
}) {
  return prisma.userSocialAccount.create({ data: input })
}
