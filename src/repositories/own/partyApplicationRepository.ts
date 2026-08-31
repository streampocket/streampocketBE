import { prisma } from '../../lib/prisma'
import type { PartyApplicationStatus, Prisma } from '@prisma/client'

type CreateApplicationInput = {
  productId: string
  userId: string
  price: number
  fee: number
  totalAmount: number
}

// 카테고리 가드는 신청 트랜잭션 안에서 최신 커밋 기준으로 읽어야 한다.
// pointRepository와 같은 관례 — 트랜잭션 클라이언트를 첫 인자로 받고, 단독 호출은 prisma를 넘긴다.
type Db = Prisma.TransactionClient | typeof prisma

/**
 * 같은 카테고리의 "다른" 파티에 승인 대기(pending) 신청이 있는지.
 * 삭제된 파티(deletedAt) 밑에 남은 고아 pending이 영구 차단으로 이어지지 않도록 거른다.
 */
export function findPendingApplicationInCategory(
  db: Db,
  input: { userId: string; categoryId: string; excludeProductId: string },
) {
  return db.partyApplication.findFirst({
    where: {
      userId: input.userId,
      status: 'pending',
      productId: { not: input.excludeProductId },
      product: { categoryId: input.categoryId, deletedAt: null },
    },
    select: { id: true, product: { select: { name: true } } },
  })
}

/**
 * 같은 카테고리에서 since 이후 반품(returnedAt)된 신청이 있는지 — 최신 반품 기준.
 * 파티 삭제로 쿨다운이 풀리면 안 되므로 deletedAt은 거르지 않는다.
 * status 필터 불필요: 반품 행은 cancelled이고, 재신청(revive)되면 returnedAt이 null로 초기화된다.
 */
export function findRecentReturnInCategory(
  db: Db,
  input: { userId: string; categoryId: string; since: Date },
) {
  return db.partyApplication.findFirst({
    where: {
      userId: input.userId,
      returnedAt: { gt: input.since },
      product: { categoryId: input.categoryId },
    },
    orderBy: { returnedAt: 'desc' },
    select: { returnedAt: true, product: { select: { name: true } } },
  })
}

export function findActiveApplication(productId: string, userId: string) {
  return prisma.partyApplication.findFirst({
    where: {
      productId,
      userId,
      status: { in: ['pending', 'confirmed'] },
    },
  })
}

export function createApplication(data: CreateApplicationInput) {
  return prisma.partyApplication.create({
    data,
    include: {
      product: {
        include: {
          category: true,
          user: { select: { id: true, name: true } },
        },
      },
    },
  })
}

export function findApplicationsByUserId(userId: string) {
  return prisma.partyApplication.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          durationDays: true,
          price: true,
          totalSlots: true,
          filledSlots: true,
          imagePath: true,
          status: true,
          partyType: true,
          category: { select: { id: true, name: true } },
        },
      },
      // 시크릿 암호문(secretEnc)은 절대 select 금지 — 유저 응답에 그대로 실리는 경로
      otpCredential: { select: { issueCount: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// 회원 탈퇴 차단 대상 신청 조회 — 승인 대기중(pending) 또는 진행 중(confirmed + 기간 유효)
export function findWithdrawalBlockingApplication(userId: string) {
  const now = new Date()
  return prisma.partyApplication.findFirst({
    where: {
      userId,
      OR: [
        { status: 'pending' },
        { status: 'confirmed', expiresAt: null },
        { status: 'confirmed', expiresAt: { gt: now } },
      ],
    },
    select: {
      status: true,
      expiresAt: true,
      product: { select: { name: true } },
    },
  })
}

export function findExpiredApplications() {
  return prisma.partyApplication.findMany({
    where: {
      status: 'confirmed',
      expiresAt: { lte: new Date() },
    },
    include: {
      product: { select: { id: true, name: true, partyType: true } },
      user: { select: { id: true, name: true } },
    },
  })
}

export function bulkExpireApplications(ids: string[]) {
  return prisma.partyApplication.updateMany({
    where: { id: { in: ids } },
    data: { status: 'expired' },
  })
}

/**
 * 신청이 들어온 시각을 KST 시(0~23)로 묶어 센다.
 *
 * 기준은 `created_at`(이용자가 신청 버튼을 누른 시각)이다.
 * 파티 주문(SteamOrderItem)의 paid_at은 관리자가 승인한 시각이라 여기에 쓸 수 없다.
 * Prisma groupBy는 시각 추출을 못 하므로 raw로 간다 (대시보드 매출 캘린더와 같은 패턴).
 * 상태는 거르지 않는다 — 취소·만료됐어도 "그 시간에 들어왔다"는 사실은 변하지 않는다.
 */
export async function groupApplicationsByHour(
  from: Date,
  to: Date,
): Promise<{ hour: number; count: number }[]> {
  const rows = await prisma.$queryRaw<Array<{ hour: string; count: bigint }>>`
    SELECT
      to_char(created_at AT TIME ZONE 'Asia/Seoul', 'HH24') AS hour,
      COUNT(*)::bigint AS count
    FROM party_applications
    WHERE created_at >= ${from}
      AND created_at <= ${to}
    GROUP BY 1
  `
  return rows.map((row) => ({ hour: Number(row.hour), count: Number(row.count) }))
}

// ─────────────── 관리자용 ───────────────

type AdminListInput = {
  status?: PartyApplicationStatus
  search?: string
  page: number
  pageSize: number
}

export async function findApplicationsForAdmin(input: AdminListInput) {
  const where: Prisma.PartyApplicationWhereInput = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.search
      ? {
          OR: [
            { user: { name: { contains: input.search, mode: 'insensitive' } } },
            { user: { phone: { contains: input.search } } },
            { product: { name: { contains: input.search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.partyApplication.findMany({
      where,
      include: {
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
      orderBy: { createdAt: 'desc' },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.partyApplication.count({ where }),
  ])

  return { items, total }
}

export function findApplicationDetailForAdmin(applicationId: string) {
  return prisma.partyApplication.findUnique({
    where: { id: applicationId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      product: {
        select: {
          id: true,
          name: true,
          durationDays: true,
          totalSlots: true,
          filledSlots: true,
          partyType: true,
          durationMode: true,
          category: { select: { id: true, name: true } },
        },
      },
    },
  })
}
