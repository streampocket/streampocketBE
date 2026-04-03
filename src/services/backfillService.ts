import { prisma } from '../lib/prisma'
import { fetchProductOrderDetails } from './platform/naverOrderSource'

const BATCH_SIZE = 50

export async function backfillDecisionDates(): Promise<{ updated: number; skipped: number }> {
  const pendingOrders = await prisma.steamOrderItem.findMany({
    where: {
      fulfillmentStatus: 'completed',
      decisionDate: null,
    },
    select: { id: true, productOrderId: true },
    orderBy: { createdAt: 'asc' },
  })

  let updated = 0
  let skipped = 0

  for (let i = 0; i < pendingOrders.length; i += BATCH_SIZE) {
    const batch = pendingOrders.slice(i, i + BATCH_SIZE)
    const productOrderIds = batch.map((o) => o.productOrderId)
    const details = await fetchProductOrderDetails(productOrderIds)

    const detailMap = new Map(
      details.map((d) => [d.productOrder.productOrderId, d]),
    )

    for (const order of batch) {
      const detail = detailMap.get(order.productOrderId)
      if (
        detail?.productOrder.productOrderStatus === 'PURCHASE_DECIDED' &&
        detail.productOrder.decisionDate != null &&
        detail.productOrder.expectedSettlementAmount != null
      ) {
        await prisma.steamOrderItem.update({
          where: { id: order.id },
          data: {
            decisionDate: new Date(detail.productOrder.decisionDate),
            settlementAmount: detail.productOrder.expectedSettlementAmount,
          },
        })
        updated += 1
      } else {
        skipped += 1
      }
    }
  }

  return { updated, skipped }
}
