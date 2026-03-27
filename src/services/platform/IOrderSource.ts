export type IncomingOrderItem = {
  externalOrderId: string
  productOrderId: string
  productName: string
  naverProductId: string
  unitPrice: number
  paidAt: Date
  receiverPhoneNumber: string | null
  receiverName: string | null
  platform: 'NAVER' | 'OWN'
}

export type IOrderSource = {
  fetchNewOrders(): Promise<IncomingOrderItem[]>
  confirmOrder(productOrderId: string): Promise<void>
  dispatchOrder(productOrderId: string): Promise<void>
}
