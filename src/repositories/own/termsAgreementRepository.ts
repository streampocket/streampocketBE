import { prisma } from '../../lib/prisma'

export async function createTermsAgreements(userId: string, types: string[]) {
  return prisma.termsAgreement.createMany({
    data: types.map((type) => ({ userId, type })),
    // 계정 통합(기존 계정에 로그인 수단 연결) 시 이미 동의한 약관과 중복될 수 있음 — @@unique([userId, type]) 충돌 방지
    skipDuplicates: true,
  })
}
