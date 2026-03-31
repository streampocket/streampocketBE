import { z } from 'zod'
import { naverApiRequest } from '../../lib/naverAuth'
import { IOrderSource, IncomingOrderItem } from './IOrderSource'

const lastChangedStatusSchema = z.object({
  orderId: z.string().min(1),
  productOrderId: z.string().min(1),
  paymentDate: z.string().min(1).optional(),
})

const lastChangedStatusesResponseSchema = z.object({
  data: z
    .object({
      lastChangeStatuses: z.array(lastChangedStatusSchema).default([]),
    })
    .optional(),
})

const queryOrderSchema = z.object({
  orderId: z.string().min(1),
  paymentDate: z.string().min(1).optional(),
  ordererId: z.string().min(1).optional(),
  ordererNo: z.union([z.string(), z.number()]).transform(String).optional(),
  ordererName: z.string().min(1).optional(),
  ordererTel: z.string().min(1).optional(),
})

const queryProductOrderSchema = z.object({
  productOrderId: z.string().min(1),
  productId: z.union([z.string(), z.number()]).transform(String),
  productName: z.string().min(1),
  unitPrice: z.number(),
})

const queryProductOrderItemSchema = z.object({
  order: queryOrderSchema,
  productOrder: queryProductOrderSchema,
})

const queryProductOrdersResponseSchema = z.object({
  data: z.array(queryProductOrderItemSchema).default([]),
})

const naverProductListResponseSchema = z.object({
  contents: z
    .array(
      z.object({
        originProductNo: z.number(),
        channelProducts: z
          .array(
            z.object({
              channelProductNo: z.number(),
              name: z.string().min(1),
            }),
          )
          .optional(),
      }),
    )
    .default([]),
})

type NaverLastChangedStatus = z.infer<typeof lastChangedStatusSchema>
type NaverQueryProductOrderItem = z.infer<typeof queryProductOrderItemSchema>

function buildNaverError(prefix: string, status: number, text: string): Error {
  return new Error(`${prefix} (${status}): ${text}`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readFailMessages(body: unknown): string[] {
  if (!isRecord(body)) return []

  const data = body.data
  if (!isRecord(data)) return []

  return Object.entries(data).flatMap(([key, value]) => {
    if (!key.toLowerCase().includes('fail') || !Array.isArray(value)) return []

    return value.flatMap((item) => {
      if (!isRecord(item)) return []

      const code = typeof item.code === 'string' ? item.code : null
      const message = typeof item.message === 'string' ? item.message : null
      const target =
        typeof item.productOrderId === 'string'
          ? item.productOrderId
          : typeof item.productOrderNo === 'string'
            ? item.productOrderNo
            : null

      const parts = [target, code, message].filter((part): part is string => part !== null)
      return parts.length > 0 ? [parts.join(' | ')] : []
    })
  })
}

function getLastChangedFrom(): string {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
}

function buildDispatchDate(): string {
  return new Date().toISOString()
}

function logFetchedOrderFields(
  changedStatus: NaverLastChangedStatus | undefined,
  detail: NaverQueryProductOrderItem,
): void {
  console.log(
    '[NAVER_ORDER_FIELDS]',
    JSON.stringify(
      {
        changedStatus: {
          orderId: changedStatus?.orderId ?? null,
          productOrderId: changedStatus?.productOrderId ?? null,
          paymentDate: changedStatus?.paymentDate ?? null,
        },
        order: {
          orderId: detail.order.orderId,
          paymentDate: detail.order.paymentDate ?? null,
          ordererId: detail.order.ordererId ?? null,
          ordererNo: detail.order.ordererNo ?? null,
          ordererName: detail.order.ordererName ?? null,
          ordererTel: detail.order.ordererTel ?? null,
        },
        productOrder: {
          productOrderId: detail.productOrder.productOrderId,
          productId: detail.productOrder.productId,
          productName: detail.productOrder.productName,
        },
        resolvedReceiverPhoneNumber: detail.order.ordererTel ?? null,
      },
      null,
      2,
    ),
  )
}

async function fetchLastChangedStatuses(): Promise<NaverLastChangedStatus[]> {
  const query = new URLSearchParams({
    lastChangedType: 'PAYED',
    lastChangedFrom: getLastChangedFrom(),
    limitCount: '300',
  })

  const res = await naverApiRequest(
    `/v1/pay-order/seller/product-orders/last-changed-statuses?${query.toString()}`,
  )

  if (!res.ok) {
    const text = await res.text()
    throw buildNaverError('네이버 신규 주문 조회 실패', res.status, text)
  }

  const body = lastChangedStatusesResponseSchema.parse(await res.json())
  return body.data?.lastChangeStatuses ?? []
}

async function fetchProductOrderDetails(
  productOrderIds: string[],
): Promise<NaverQueryProductOrderItem[]> {
  if (productOrderIds.length === 0) return []

  const res = await naverApiRequest('/v1/pay-order/seller/product-orders/query', {
    method: 'POST',
    body: JSON.stringify({ productOrderIds }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw buildNaverError('네이버 주문 상세 조회 실패', res.status, text)
  }

  const body = queryProductOrdersResponseSchema.parse(await res.json())
  return body.data
}

export async function fetchNaverProducts(): Promise<{ productId: string; name: string }[]> {
  const res = await naverApiRequest('/v1/products/search', {
    method: 'POST',
    body: JSON.stringify({
      page: 1,
      size: 100,
      productStatusTypes: ['SALE', 'OUTOFSTOCK', 'WAIT'],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw buildNaverError('네이버 상품 목록 조회 실패', res.status, text)
  }

  const body = naverProductListResponseSchema.parse(await res.json())

  return body.contents.map((item) => ({
    productId: String(item.channelProducts?.[0]?.channelProductNo ?? item.originProductNo),
    name: item.channelProducts?.[0]?.name ?? `네이버 상품 ${item.originProductNo}`,
  }))
}

export const naverOrderSource: IOrderSource = {
  async fetchNewOrders(): Promise<IncomingOrderItem[]> {
    const changedStatuses = await fetchLastChangedStatuses()
    const productOrderIds = changedStatuses.map((status) => status.productOrderId)
    const details = await fetchProductOrderDetails(productOrderIds)
    const changedStatusByProductOrderId = new Map(
      changedStatuses.map((status) => [status.productOrderId, status]),
    )

    return details.map((detail) => {
      const changedStatus = changedStatusByProductOrderId.get(detail.productOrder.productOrderId)
      const paidAt = detail.order.paymentDate ?? changedStatus?.paymentDate
      logFetchedOrderFields(changedStatus, detail)

      return {
        externalOrderId: detail.order.orderId,
        productOrderId: detail.productOrder.productOrderId,
        productName: detail.productOrder.productName,
        naverProductId: detail.productOrder.productId,
        unitPrice: detail.productOrder.unitPrice,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        receiverPhoneNumber: detail.order.ordererTel ?? null,
        receiverName: detail.order.ordererName ?? null,
        platform: 'NAVER',
      }
    })
  },

  async confirmOrder(productOrderId: string): Promise<void> {
    const res = await naverApiRequest('/v1/pay-order/seller/product-orders/confirm', {
      method: 'POST',
      body: JSON.stringify({ productOrderIds: [productOrderId] }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw buildNaverError('발주 확인 실패', res.status, text)
    }

    const body = await res.json()
    const failMessages = readFailMessages(body)
    if (failMessages.length > 0) {
      throw new Error(`발주 확인 실패: ${failMessages.join(', ')}`)
    }
  },

  async dispatchOrder(productOrderId: string): Promise<void> {
    const res = await naverApiRequest('/v1/pay-order/seller/product-orders/dispatch', {
      method: 'POST',
      body: JSON.stringify({
        dispatchProductOrders: [
          {
            productOrderId: productOrderId,
            dispatchDate: buildDispatchDate(),
            deliveryMethod: 'DIRECT_DELIVERY',
            deliveryCompanyCode: 'DIRECT',
            trackingNumber: productOrderId,
          },
        ],
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw buildNaverError('발송 처리 실패', res.status, text)
    }

    const body = await res.json().catch(() => null)
    const failMessages = readFailMessages(body)
    if (failMessages.length > 0) {
      throw new Error(`발송 처리 실패: ${failMessages.join(', ')}`)
    }
  },
}
