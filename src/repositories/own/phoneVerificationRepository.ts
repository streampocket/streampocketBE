import { prisma } from '../../lib/prisma'

type CreateVerificationInput = {
  phone: string
  code: string
  expiresAt: Date
}

export async function createPhoneVerification(input: CreateVerificationInput) {
  return prisma.phoneVerification.create({ data: input })
}

export async function findLatestUnverified(phone: string) {
  return prisma.phoneVerification.findFirst({
    where: { phone, verified: false },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findVerificationById(id: string) {
  return prisma.phoneVerification.findUnique({ where: { id } })
}

export async function markVerified(id: string) {
  return prisma.phoneVerification.update({
    where: { id },
    data: { verified: true },
  })
}

export async function incrementAttempts(id: string) {
  return prisma.phoneVerification.update({
    where: { id },
    data: { attempts: { increment: 1 } },
  })
}

export async function countRecentByPhone(phone: string, since: Date) {
  return prisma.phoneVerification.count({
    where: { phone, createdAt: { gte: since } },
  })
}

export async function findMostRecentByPhone(phone: string) {
  return prisma.phoneVerification.findFirst({
    where: { phone },
    orderBy: { createdAt: 'desc' },
  })
}
