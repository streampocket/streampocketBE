import { prisma } from '../../lib/prisma'
import type { GcoinOrderStatus, Prisma } from '@prisma/client'

type CreateGcoinOrderInput = {
  orderNo: string
  productId: string
  productName: string
  gcoinAmount: number | null
  salePrice: number
  quantity: number
  buyerPhone: string
}

type GcoinOrderFilters = {
  status?: GcoinOrderStatus
  search?: string
  page: number
  pageSize: number
}

export function createGcoinOrder(data: CreateGcoinOrderInput) {
  return prisma.gcoinOrder.create({ data })
}

export function findGcoinOrderById(id: string) {
  return prisma.gcoinOrder.findUnique({ where: { id } })
}

/** 같은 상품에 대기 중 신청이 이미 있는지 (중복 신청 방지) */
export function findPendingOrderByPhoneAndProduct(buyerPhone: string, productId: string) {
  return prisma.gcoinOrder.findFirst({
    where: { buyerPhone, productId, status: 'pending' },
  })
}

/** 구매자 본인 주문 목록 (최신순) */
export function findGcoinOrdersByPhone(buyerPhone: string) {
  return prisma.gcoinOrder.findMany({
    where: { buyerPhone },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findAllGcoinOrders(filters: GcoinOrderFilters) {
  const where: Prisma.GcoinOrderWhereInput = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search
      ? {
          OR: [
            { orderNo: { contains: filters.search, mode: 'insensitive' as const } },
            { productName: { contains: filters.search, mode: 'insensitive' as const } },
            { buyerPhone: { contains: filters.search } },
          ],
        }
      : {}),
  }

  const [items, total] = await prisma.$transaction([
    prisma.gcoinOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.gcoinOrder.count({ where }),
  ])
  return { items, total }
}

/** 상태별 카운트 (관리자 탭 뱃지용) */
export async function countGcoinOrdersByStatus() {
  const groups = await prisma.gcoinOrder.groupBy({
    by: ['status'],
    _count: { _all: true },
  })
  const counts = { pending: 0, approved: 0, rejected: 0 }
  for (const group of groups) {
    counts[group.status] = group._count._all
  }
  return counts
}

/** 주문번호 생성 — PUBG_<YYYYMMDDHHmmss>_<3자리 랜덤>, unique 제약 + 재시도 */
export async function generateGcoinOrderNo(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
    const ts = kst.toISOString().replace(/[-:T.]/g, '').slice(0, 14)
    const rand = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
    const candidate = `PUBG_${ts}_${rand}`
    const existing = await prisma.gcoinOrder.findUnique({ where: { orderNo: candidate } })
    if (!existing) return candidate
  }
  throw Object.assign(new Error('주문번호 생성에 실패했습니다. 다시 시도해 주세요.'), {
    statusCode: 500,
  })
}

/** 승인 트랜잭션 — 상태 전환 + 상품 구매수 증가 */
export function approveGcoinOrderTx(orderId: string, productId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.gcoinOrder.update({
      where: { id: orderId },
      data: { status: 'approved', approvedAt: new Date() },
    })
    await tx.gcoinProduct.update({
      where: { id: productId },
      data: { purchaseCount: { increment: 1 } },
    })
    return order
  })
}

export function rejectGcoinOrder(orderId: string, rejectReason: string | null) {
  return prisma.gcoinOrder.update({
    where: { id: orderId },
    data: { status: 'rejected', rejectedAt: new Date(), rejectReason },
  })
}

/** 승인 후 편입된 통합 주문 연결 */
export function linkSteamOrderItem(orderId: string, steamOrderItemId: string) {
  return prisma.gcoinOrder.update({
    where: { id: orderId },
    data: { steamOrderItemId },
  })
}
