export type IncomingOrderItem = {
  externalOrderId: string      // 플랫폼 주문번호 (네이버: orderId)
  productOrderId: string       // 상품주문번호 (멱등성 키)
  productName: string
  naverProductId: string       // 상품 매칭에 사용
  unitPrice: number
  paidAt: Date
  buyerEmail: string | null    // inputOptions 파싱 실패 시 null
  platform: 'NAVER' | 'OWN'
}

export type IOrderSource = {
  fetchNewOrders(): Promise<IncomingOrderItem[]>
  confirmOrder(productOrderId: string): Promise<void>
  dispatchOrder(productOrderId: string): Promise<void>
}
