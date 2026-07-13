import { prisma } from '../../lib/prisma'

type CreateVerificationInput = {
  phone: string
  code: string
  expiresAt: Date
  privacyAgreedAt: Date
}

export function createGcoinPhoneVerification(input: CreateVerificationInput) {
  return prisma.gcoinPhoneVerification.create({ data: input })
}

export function findLatestUnverified(phone: string) {
  return prisma.gcoinPhoneVerification.findFirst({
    where: { phone, verified: false },
    orderBy: { createdAt: 'desc' },
  })
}

export function markVerified(id: string) {
  return prisma.gcoinPhoneVerification.update({
    where: { id },
    data: { verified: true },
  })
}

export function incrementAttempts(id: string) {
  return prisma.gcoinPhoneVerification.update({
    where: { id },
    data: { attempts: { increment: 1 } },
  })
}

export function countRecentByPhone(phone: string, since: Date) {
  return prisma.gcoinPhoneVerification.count({
    where: { phone, createdAt: { gte: since } },
  })
}

export function findMostRecentByPhone(phone: string) {
  return prisma.gcoinPhoneVerification.findFirst({
    where: { phone },
    orderBy: { createdAt: 'desc' },
  })
}
