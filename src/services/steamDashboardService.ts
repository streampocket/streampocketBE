import { prisma } from '../lib/prisma'

export async function getDashboardStats() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    todayOrderCount,
    pendingCount,
    manualReviewCount,
    failedCount,
    stockByProduct,
  ] = await Promise.all([
    // 오늘 주문 수
    prisma.steamOrderItem.count({
      where: { createdAt: { gte: todayStart } },
    }),
    // 처리 대기 주문
    prisma.steamOrderItem.count({ where: { fulfillmentStatus: 'pending' } }),
    // 수동 처리 필요
    prisma.steamOrderItem.count({ where: { fulfillmentStatus: 'manual_review' } }),
    // 실패
    prisma.steamOrderItem.count({ where: { fulfillmentStatus: 'failed' } }),
    // 상품별 사용 가능 코드 수
    prisma.steamProduct.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            codes: { where: { status: 'available' } },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
  ])

  return {
    today: {
      orderCount: todayOrderCount,
    },
    orders: {
      pending: pendingCount,
      manualReview: manualReviewCount,
      failed: failedCount,
    },
    stock: stockByProduct.map((p) => ({
      productId: p.id,
      productName: p.name,
      availableCodes: p._count.codes,
    })),
  }
}
