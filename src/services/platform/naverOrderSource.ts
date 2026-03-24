import { naverApiRequest } from '../../lib/naverAuth'
import { IOrderSource, IncomingOrderItem } from './IOrderSource'

// 네이버 Commerce API 응답 타입 (필요한 필드만 정의)
type NaverInputOption = {
  optionName: string
  optionAnswer: string
}

type NaverOrderItem = {
  productOrderId: string
  productId: string
  productName: string
  unitPrice: number
  paymentDate: string
  inputOptions?: NaverInputOption[]
}

type NaverOrder = {
  orderId: string
  orderItems: NaverOrderItem[]
}

type NewOrderResponse = {
  data: {
    lastChangeStatuses: NaverOrder[]
  }
}

type NaverProductItem = {
  originProductNo: number
  channelProducts?: Array<{
    name: string
  }>
}

type NaverProductListResponse = {
  contents: NaverProductItem[]
}

// inputOptions에서 구매자 이메일 추출 (환경변수 옵션명과 일치하는 항목 탐색)
function extractBuyerEmail(inputOptions: NaverInputOption[] | undefined): string | null {
  if (!inputOptions || inputOptions.length === 0) return null

  const emailOptionName = process.env['NAVER_EMAIL_OPTION_NAME']
  if (!emailOptionName) return null

  const option = inputOptions.find((o) => o.optionName.trim() === emailOptionName.trim())
  return option?.optionAnswer ?? null
}

// 네이버 스마트스토어 상품 목록 조회
export async function fetchNaverProducts(): Promise<{ productId: string; name: string }[]> {
  const res = await naverApiRequest('/v1/products/search', {
    method: 'POST',
    body: JSON.stringify({
      page: 1,
      size: 100,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`네이버 상품 목록 조회 실패 (${res.status}): ${text}`)
  }

  const body = (await res.json()) as NaverProductListResponse
  const contents = body.contents ?? []

  return contents.map((item) => ({
    productId: String(item.originProductNo),
    name: item.channelProducts?.[0]?.name ?? `네이버 상품 ${item.originProductNo}`,
  }))
}

export const naverOrderSource: IOrderSource = {
  async fetchNewOrders(): Promise<IncomingOrderItem[]> {
    // 최근 변경 기준 폴링 — 발주 확인 대기(PAYED) 상태 주문 조회
    const res = await naverApiRequest(
      '/v1/pay-order/seller/orders/new-order?orderStatusType=PAYED',
    )

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`네이버 신규 주문 조회 실패 (${res.status}): ${text}`)
    }

    const body = (await res.json()) as NewOrderResponse
    const orders = body.data?.lastChangeStatuses ?? []

    const items: IncomingOrderItem[] = []

    for (const order of orders) {
      for (const item of order.orderItems) {
        const buyerEmail = extractBuyerEmail(item.inputOptions)
        items.push({
          externalOrderId: order.orderId,
          productOrderId: item.productOrderId,
          productName: item.productName,
          naverProductId: item.productId,
          unitPrice: item.unitPrice,
          paidAt: new Date(item.paymentDate),
          buyerEmail,
          platform: 'NAVER',
        })
      }
    }

    return items
  },

  async confirmOrder(productOrderId: string): Promise<void> {
    const res = await naverApiRequest(
      '/v1/pay-order/seller/orders/product-order/dispatch-confirm',
      {
        method: 'PUT',
        body: JSON.stringify({ productOrderIds: [productOrderId] }),
      },
    )
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`발주 확인 실패 (${res.status}): ${text}`)
    }
  },

  async dispatchOrder(productOrderId: string): Promise<void> {
    const res = await naverApiRequest('/v1/pay-order/seller/orders/dispatch', {
      method: 'POST',
      body: JSON.stringify({
        dispatchProductOrders: [
          {
            productOrderId,
            deliveryMethod: 'DIRECT_DELIVERY', // 직접 전달 (디지털 상품)
            deliveryCompanyCode: 'DIRECT',
            trackingNumber: productOrderId,    // 트래킹 번호 대신 주문번호 사용
          },
        ],
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`발송 처리 실패 (${res.status}): ${text}`)
    }
  },
}
