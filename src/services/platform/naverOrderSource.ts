import { z } from 'zod'
import { naverApiRequest } from '../../lib/naverAuth'
import { sendDiscordAlert } from '../../lib/discord'
import {
  IOrderSource,
  IncomingOrderItem,
  ReturnedOrderInfo,
  PurchaseDecidedInfo,
} from './IOrderSource'

const NAVER_PRODUCT_PAGE_SIZE = 100
const NAVER_PRODUCT_MAX_PAGES = 50
const PAID_ORDERS_MAX_PAGES = 20

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
  claimType: z.string().optional(),
  claimStatus: z.string().optional(),
  productOrderStatus: z.string().optional(),
  decisionDate: z.string().optional(),
  expectedSettlementAmount: z.number().optional(),
})

const queryProductOrderItemSchema = z.object({
  order: queryOrderSchema,
  productOrder: queryProductOrderSchema,
})

const queryProductOrdersResponseSchema = z.object({
  data: z.array(queryProductOrderItemSchema).default([]),
})

const paidOrdersSearchResponseSchema = z.object({
  data: z
    .object({
      contents: z
        .array(
          z.object({
            productOrderId: z.string().min(1),
            content: queryProductOrderItemSchema,
          }),
        )
        .default([]),
      pagination: z
        .object({
          page: z.number(),
          size: z.number(),
          hasNext: z.boolean(),
        })
        .optional(),
    })
    .optional(),
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
              salePrice: z.number().optional(),
              discountedPrice: z.number().optional(),
              mobileDiscountedPrice: z.number().optional(),
            }),
          )
          .optional(),
      }),
    )
    .default([]),
  totalElements: z.number().optional(),
  totalPages: z.number().optional(),
})

type NaverProductListResponse = z.infer<typeof naverProductListResponseSchema>

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

async function fetchLastChangedStatuses(
  lastChangedType: string = 'PAYED',
): Promise<NaverLastChangedStatus[]> {
  const query = new URLSearchParams({
    lastChangedType,
    lastChangedFrom: getLastChangedFrom(),
    limitCount: '300',
  })

  const res = await naverApiRequest(
    `/v1/pay-order/seller/product-orders/last-changed-statuses?${query.toString()}`,
  )

  if (!res.ok) {
    const text = await res.text()
    throw buildNaverError(`네이버 주문 상태 조회 실패 (${lastChangedType})`, res.status, text)
  }

  const body = lastChangedStatusesResponseSchema.parse(await res.json())
  return body.data?.lastChangeStatuses ?? []
}

export async function fetchProductOrderDetails(
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

async function fetchNaverProductsPage(page: number): Promise<NaverProductListResponse> {
  const res = await naverApiRequest('/v1/products/search', {
    method: 'POST',
    body: JSON.stringify({
      page,
      size: NAVER_PRODUCT_PAGE_SIZE,
      productStatusTypes: ['SALE', 'OUTOFSTOCK', 'WAIT'],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw buildNaverError('네이버 상품 목록 조회 실패', res.status, text)
  }

  return naverProductListResponseSchema.parse(await res.json())
}

export async function fetchNaverProducts(): Promise<{
  productId: string
  name: string
  price: number | null
  discountPricePc: number | null
  discountPriceMobile: number | null
}[]> {
  const collected: NaverProductListResponse['contents'] = []
  let page = 1
  let totalPages: number | undefined

  while (page <= NAVER_PRODUCT_MAX_PAGES) {
    const body = await fetchNaverProductsPage(page)
    collected.push(...body.contents)

    totalPages = body.totalPages
    const reachedEndByCount = body.totalElements !== undefined && collected.length >= body.totalElements
    const reachedEndByPages = totalPages !== undefined && page >= totalPages
    const reachedEndByEmpty = body.contents.length < NAVER_PRODUCT_PAGE_SIZE

    if (reachedEndByCount || reachedEndByPages || reachedEndByEmpty) {
      break
    }

    page += 1
  }

  if (totalPages !== undefined && totalPages > NAVER_PRODUCT_MAX_PAGES) {
    const message = `네이버 상품 동기화 상한 초과 — totalPages=${totalPages}, 수집=${collected.length}, 상한=${NAVER_PRODUCT_MAX_PAGES * NAVER_PRODUCT_PAGE_SIZE}`
    console.warn('[NAVER_PRODUCT_SYNC]', message)
    await sendDiscordAlert('error', `⚠️ ${message}`)
  }

  return collected.map((item) => {
    const channel = item.channelProducts?.[0]
    const salePrice = channel?.salePrice ?? null
    const normalizeDiscount = (value: number | undefined): number | null => {
      if (value == null) return null
      if (salePrice != null && value === salePrice) return null
      return value
    }
    return {
      productId: String(channel?.channelProductNo ?? item.originProductNo),
      name: channel?.name ?? `네이버 상품 ${item.originProductNo}`,
      price: salePrice,
      discountPricePc: normalizeDiscount(channel?.discountedPrice),
      discountPriceMobile: normalizeDiscount(channel?.mobileDiscountedPrice),
    }
  })
}

function detailToIncomingOrderItem(detail: NaverQueryProductOrderItem): IncomingOrderItem {
  const paidAt = detail.order.paymentDate
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
    naverProductOrderStatus: detail.productOrder.productOrderStatus,
    naverClaimStatus: detail.productOrder.claimStatus ?? null,
  }
}

async function fetchPaidOrdersSearchPage(
  fromIso: string,
  page: number,
): Promise<{
  contents: { productOrderId: string; content: NaverQueryProductOrderItem }[]
  hasNext: boolean
}> {
  const query = new URLSearchParams({
    from: fromIso,
    rangeType: 'PAYED_DATETIME',
    page: String(page),
  })

  const res = await naverApiRequest(
    `/v1/pay-order/seller/product-orders?${query.toString()}`,
  )

  if (!res.ok) {
    const text = await res.text()
    throw buildNaverError('네이버 보조 주문 조회 실패', res.status, text)
  }

  const body = paidOrdersSearchResponseSchema.parse(await res.json())
  return {
    contents: body.data?.contents ?? [],
    hasNext: body.data?.pagination?.hasNext ?? false,
  }
}

async function fetchPaidOrdersSince(fromIso: string): Promise<NaverQueryProductOrderItem[]> {
  const collected: NaverQueryProductOrderItem[] = []
  let page = 1

  while (page <= PAID_ORDERS_MAX_PAGES) {
    const { contents, hasNext } = await fetchPaidOrdersSearchPage(fromIso, page)
    for (const entry of contents) {
      collected.push(entry.content)
    }
    if (!hasNext) break
    page += 1
  }

  if (page > PAID_ORDERS_MAX_PAGES) {
    const message = `네이버 보조 주문 조회 페이지 상한 초과 — 수집=${collected.length}, 상한=${PAID_ORDERS_MAX_PAGES}페이지`
    console.warn('[NAVER_PAID_SEARCH]', message)
    await sendDiscordAlert('error', `⚠️ ${message}`)
  }

  return collected
}

export const naverOrderSource: IOrderSource = {
  async fetchNewOrders(): Promise<IncomingOrderItem[]> {
    const changedStatuses = await fetchLastChangedStatuses('PAYED')
    const productOrderIds = changedStatuses.map((status) => status.productOrderId)
    const details = await fetchProductOrderDetails(productOrderIds)
    const changedStatusByProductOrderId = new Map(
      changedStatuses.map((status) => [status.productOrderId, status]),
    )

    return details.map((detail) => {
      const changedStatus = changedStatusByProductOrderId.get(detail.productOrder.productOrderId)
      logFetchedOrderFields(changedStatus, detail)
      const item = detailToIncomingOrderItem(detail)
      const fallbackPaidAt = changedStatus?.paymentDate
      if (!detail.order.paymentDate && fallbackPaidAt) {
        item.paidAt = new Date(fallbackPaidAt)
      }
      return item
    })
  },

  async fetchPaidOrdersInWindow(hoursBack: number): Promise<IncomingOrderItem[]> {
    const fromIso = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()
    const details = await fetchPaidOrdersSince(fromIso)
    return details.map(detailToIncomingOrderItem)
  },

  async fetchPaidOrdersForDay(dateKST: string): Promise<IncomingOrderItem[]> {
    const fromIso = `${dateKST}T00:00:00.000+09:00`
    const dayStartUtc = new Date(fromIso).getTime()
    const dayEndUtc = dayStartUtc + 24 * 60 * 60 * 1000
    const details = await fetchPaidOrdersSince(fromIso)
    return details
      .filter((detail) => {
        const paymentDate = detail.order.paymentDate
        if (!paymentDate) return false
        const paidMs = new Date(paymentDate).getTime()
        return paidMs >= dayStartUtc && paidMs < dayEndUtc
      })
      .map(detailToIncomingOrderItem)
  },

  async fetchReturnedOrders(): Promise<ReturnedOrderInfo[]> {
    const changedStatuses = await fetchLastChangedStatuses('CLAIM_REQUESTED')
    const productOrderIds = changedStatuses.map((status) => status.productOrderId)
    const details = await fetchProductOrderDetails(productOrderIds)
    const changedStatusByProductOrderId = new Map(
      changedStatuses.map((status) => [status.productOrderId, status]),
    )

    return details
      .filter((detail) => detail.productOrder.claimType === 'RETURN')
      .map((detail) => {
        const changedStatus = changedStatusByProductOrderId.get(detail.productOrder.productOrderId)
        const paidAt = detail.order.paymentDate ?? changedStatus?.paymentDate

        return {
          productOrderId: detail.productOrder.productOrderId,
          claimType: detail.productOrder.claimType ?? 'RETURN',
          claimStatus: detail.productOrder.claimStatus ?? '',
          externalOrderId: detail.order.orderId,
          productName: detail.productOrder.productName,
          naverProductId: detail.productOrder.productId,
          unitPrice: detail.productOrder.unitPrice,
          paidAt: paidAt ? new Date(paidAt) : new Date(),
          receiverPhoneNumber: detail.order.ordererTel ?? null,
          receiverName: detail.order.ordererName ?? null,
        }
      })
  },

  async fetchPurchaseDecidedOrders(): Promise<PurchaseDecidedInfo[]> {
    const changedStatuses = await fetchLastChangedStatuses('PURCHASE_DECIDED')
    const productOrderIds = changedStatuses.map((status) => status.productOrderId)
    const details = await fetchProductOrderDetails(productOrderIds)

    return details
      .filter(
        (detail) =>
          detail.productOrder.productOrderStatus === 'PURCHASE_DECIDED' &&
          detail.productOrder.decisionDate != null &&
          detail.productOrder.expectedSettlementAmount != null,
      )
      .map((detail) => ({
        productOrderId: detail.productOrder.productOrderId,
        decisionDate: new Date(detail.productOrder.decisionDate!),
        settlementAmount: detail.productOrder.expectedSettlementAmount!,
      }))
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
