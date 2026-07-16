import { prisma } from '../../lib/prisma'
import { AuthProvider } from '@prisma/client'

type CreateUserInput = {
  email: string
  password?: string
  name: string
  phone: string
  phoneVerified: boolean
  provider: AuthProvider
  providerId?: string
}

type UpdateUserPhoneInput = {
  id: string
  phone: string
  phoneVerified: boolean
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function findUserByProvider(provider: AuthProvider, providerId: string) {
  return prisma.user.findUnique({
    where: { provider_providerId: { provider, providerId } },
  })
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}

export async function findUserByPhone(phone: string) {
  return prisma.user.findUnique({ where: { phone } })
}

export async function createUser(input: CreateUserInput) {
  return prisma.user.create({ data: input })
}

export async function updateUserPhone(input: UpdateUserPhoneInput) {
  return prisma.user.update({
    where: { id: input.id },
    data: { phone: input.phone, phoneVerified: input.phoneVerified },
  })
}

// ─────────────── 회원 탈퇴 ───────────────

type WithdrawUserInput = {
  deletedAt: Date
  withdrawalReason: string
  withdrawnByAdmin: boolean
  originalEmail: string
  originalPhone: string
  email: string
  phone: string
}

// 탈퇴 처리 — 유니크 컬럼(email/phone/providerId)을 익명화해 즉시 재가입을 허용한다
export async function withdrawUserById(id: string, input: WithdrawUserInput) {
  return prisma.user.update({
    where: { id },
    data: {
      ...input,
      password: null,
      providerId: null,
      phoneVerified: false,
    },
  })
}

// 보관 기한이 지난 탈퇴 회원 조회 (완전 삭제 대상)
export async function findWithdrawnUsersBefore(cutoff: Date) {
  return prisma.user.findMany({
    where: { deletedAt: { not: null, lte: cutoff } },
    select: { id: true, name: true, deletedAt: true },
  })
}

// 완전 삭제 — TermsAgreement는 Cascade, PartyApplication/OwnReview/CommunityPost는 SetNull로 익명 보존
export async function deleteUserById(id: string) {
  return prisma.user.delete({ where: { id } })
}
