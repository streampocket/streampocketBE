import type { PartyApplicationStatus, Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'

type Db = Prisma.TransactionClient | typeof prisma

// 재구매 요청 판정·금액 계산에 필요한 원 신청 정보
export function findApplicationForRenewal(db: Db, applicationId: string) {
  return db.partyApplication.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      userId: true,
      status: true,
      expiresAt: true,
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          durationDays: true,
          durationMode: true,
          partyType: true,
          deletedAt: true,
          category: { select: { name: true } },
        },
      },
    },
  })
}

export function findPendingRenewalByApplication(db: Db, applicationId: string) {
  return db.partyRenewal.findFirst({
    where: { applicationId, status: 'pending' },
    select: { id: true },
  })
}

export function createRenewal(
  db: Db,
  data: {
    applicationId: string
    price: number
    discount: number
    fee: number
    totalAmount: number
  },
) {
  return db.partyRenewal.create({ data })
}

// 신청관리 목록·상세에 쓰는 원 신청·유저·파티 정보 (일반 신청 목록과 같은 모양으로 맞춘다)
const RENEWAL_ADMIN_INCLUDE = {
  application: {
    select: {
      id: true,
      status: true,
      startedAt: true,
      expiresAt: true,
      dramaAccountId: true,
      dramaMemberId: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      product: {
        select: {
          id: true,
          name: true,
          durationDays: true,
          partyType: true,
          durationMode: true,
          category: { select: { id: true, name: true } },
        },
      },
    },
  },
} satisfies Prisma.PartyRenewalInclude

type AdminListInput = {
  status?: PartyApplicationStatus
  search?: string
  /** 병합 목록용 — 앞에서부터 이만큼 가져온다 (skip 없음) */
  take: number
}

function adminWhere(input: { status?: PartyApplicationStatus; search?: string }) {
  return {
    ...(input.status ? { status: input.status } : {}),
    ...(input.search
      ? {
          OR: [
            { application: { user: { name: { contains: input.search, mode: 'insensitive' } } } },
            { application: { user: { phone: { contains: input.search } } } },
            { application: { product: { name: { contains: input.search, mode: 'insensitive' } } } },
          ],
        }
      : {}),
  } satisfies Prisma.PartyRenewalWhereInput
}

export async function findRenewalsForAdmin(input: AdminListInput) {
  const where = adminWhere(input)
  const [items, total] = await Promise.all([
    prisma.partyRenewal.findMany({
      where,
      include: RENEWAL_ADMIN_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: input.take,
    }),
    prisma.partyRenewal.count({ where }),
  ])
  return { items, total }
}

export function findRenewalDetailForAdmin(renewalId: string) {
  return prisma.partyRenewal.findUnique({
    where: { id: renewalId },
    include: {
      application: {
        select: {
          ...RENEWAL_ADMIN_INCLUDE.application.select,
          dramaAccount: { select: { email: true, dueAt: true } },
        },
      },
    },
  })
}

// 마이페이지 — 내 신청들에 걸린 대기 중 재구매 (카드마다 "재구매 대기중" 표시용)
export function findPendingRenewalsByApplicationIds(applicationIds: string[]) {
  if (applicationIds.length === 0) return Promise.resolve([])
  return prisma.partyRenewal.findMany({
    where: { applicationId: { in: applicationIds }, status: 'pending' },
    select: { id: true, applicationId: true, totalAmount: true, usedPoint: true, createdAt: true },
  })
}

// 원 신청 파티원 제거 시 함께 정리할 재구매 (대기 → 취소, 포인트 반환 대상)
export function findOpenRenewalsByApplication(db: Db, applicationId: string) {
  return db.partyRenewal.findMany({
    where: { applicationId, status: { in: ['pending', 'confirmed'] } },
    select: { id: true, status: true },
  })
}

export function cancelRenewals(db: Db, ids: string[]) {
  return db.partyRenewal.updateMany({
    where: { id: { in: ids }, status: { in: ['pending', 'confirmed'] } },
    data: { status: 'cancelled', decidedAt: new Date() },
  })
}

// 리뷰 작성 가능 목록 — 확정 재구매 중 리뷰가 없는 것
export function findReviewableRenewals(userId: string) {
  return prisma.partyRenewal.findMany({
    where: { status: 'confirmed', review: null, application: { userId } },
    select: {
      id: true,
      totalAmount: true,
      usedPoint: true,
      extendedFrom: true,
      extendedTo: true,
      application: {
        select: {
          product: {
            select: {
              id: true,
              name: true,
              category: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
