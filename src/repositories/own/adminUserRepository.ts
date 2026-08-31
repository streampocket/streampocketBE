import { prisma } from '../../lib/prisma'
import type { AuthProvider } from '@prisma/client'

export type UserStatusFilter = 'active' | 'withdrawn'

type ListUsersInput = {
  search?: string
  provider?: AuthProvider
  status: UserStatusFilter
  page: number
  pageSize: number
}

/**
 * 가입일 기준 회원 수 — 방문자 통계의 "오늘 가입" 카드용.
 *
 * 탈퇴 회원(deletedAt)도 센다. "그날 가입했다"는 사실은 나중에 탈퇴해도 변하지 않고,
 * 빼면 어제 숫자가 오늘 줄어드는 지표가 된다.
 */
export function countUsersCreatedBetween(from: Date, to: Date): Promise<number> {
  return prisma.user.count({ where: { createdAt: { gte: from, lte: to } } })
}

export async function findUsers(input: ListUsersInput) {
  const searchFields =
    input.status === 'withdrawn'
      ? // 탈퇴 회원은 email/phone이 익명화돼 있어 원본 컬럼으로 검색
        [
          { originalEmail: { contains: input.search, mode: 'insensitive' as const } },
          { name: { contains: input.search, mode: 'insensitive' as const } },
          { originalPhone: { contains: input.search } },
        ]
      : [
          { email: { contains: input.search, mode: 'insensitive' as const } },
          { name: { contains: input.search, mode: 'insensitive' as const } },
          { phone: { contains: input.search } },
        ]

  const where = {
    deletedAt: input.status === 'withdrawn' ? { not: null } : null,
    ...(input.provider ? { provider: input.provider } : {}),
    ...(input.search ? { OR: searchFields } : {}),
  }

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        phoneVerified: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        withdrawalReason: true,
        withdrawnByAdmin: true,
        originalEmail: true,
        originalPhone: true,
        _count: {
          select: {
            partyApplications: { where: { status: 'confirmed' } },
          },
        },
      },
      orderBy: input.status === 'withdrawn' ? { deletedAt: 'desc' } : { createdAt: 'desc' },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.user.count({ where }),
  ])

  return { items, total }
}

export function findUserDetailById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      phoneVerified: true,
      provider: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      withdrawalReason: true,
      withdrawnByAdmin: true,
      originalEmail: true,
      originalPhone: true,
      pointBalance: true,
      termsAgreements: {
        select: { type: true, agreedAt: true },
        orderBy: { agreedAt: 'desc' },
      },
      partyApplications: {
        select: {
          id: true,
          status: true,
          price: true,
          fee: true,
          totalAmount: true,
          usedPoint: true,
          startedAt: true,
          expiresAt: true,
          // 반품 시각 — 재신청 차단(returnCooldowns) 계산 + 카드 "반품" 뱃지 구분용
          returnedAt: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              status: true,
              durationDays: true,
              // 아래는 회원 상세의 "참여 파티" 카드용 —
              // price는 신청 시점 실결제가(application.price)와 비교해
              // 기간 차감이 실제로 일어났는지 판정하는 데 쓴다
              leaderName: true,
              price: true,
              totalSlots: true,
              filledSlots: true,
              category: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}
