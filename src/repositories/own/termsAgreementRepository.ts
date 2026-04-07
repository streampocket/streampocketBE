import { prisma } from '../../lib/prisma'

export async function createTermsAgreements(userId: string, types: string[]) {
  return prisma.termsAgreement.createMany({
    data: types.map((type) => ({ userId, type })),
  })
}
