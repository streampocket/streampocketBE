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

// 계정 통합 매칭용 — 탈퇴(소프트 삭제) 계정은 phone이 익명화되지만 방어적으로 deletedAt도 확인
export async function findActiveUserByPhone(phone: string) {
  return prisma.user.findFirst({ where: { phone, deletedAt: null } })
}

export async function createUser(input: CreateUserInput) {
  return prisma.user.create({ data: input })
}

// 소셜 가입 시 User + 소셜 연동을 한 트랜잭션으로 생성
export async function createUserWithSocialAccount(
  input: CreateUserInput & { socialProviderId: string },
) {
  const { socialProviderId, ...userInput } = input
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userInput })
    await tx.userSocialAccount.create({
      data: { userId: user.id, provider: userInput.provider, providerId: socialProviderId },
    })
    return user
  })
}

// 이메일 가입 병합 — 기존(소셜) 계정에 이메일/비밀번호/이름을 부여해 이메일 로그인도 가능하게
export async function updateUserCredentials(
  id: string,
  input: { email: string; password: string; name: string },
) {
  return prisma.user.update({ where: { id }, data: input })
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

// 탈퇴 처리 — 유니크 컬럼(email/phone/providerId)을 익명화해 즉시 재가입을 허용한다.
// 소셜 연동 링크도 함께 삭제해 탈퇴 계정으로의 소셜 로그인 매칭을 끊는다 (같은 트랜잭션).
export async function withdrawUserById(id: string, input: WithdrawUserInput) {
  const [user] = await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: {
        ...input,
        password: null,
        providerId: null,
        phoneVerified: false,
      },
    }),
    prisma.userSocialAccount.deleteMany({ where: { userId: id } }),
  ])
  return user
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
