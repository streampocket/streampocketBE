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
  naverProductOrderStatus?: string
  naverClaimStatus?: string | null
}

export type ReturnedOrderInfo = {
  productOrderId: string
  claimType: string
  claimStatus: string
  externalOrderId: string
  productName: string
  naverProductId: string
  unitPrice: number
  paidAt: Date
  receiverPhoneNumber: string | null
  receiverName: string | null
}

export type PurchaseDecidedInfo = {
  productOrderId: string
  decisionDate: Date
  settlementAmount: number
}

export type IOrderSource = {
  fetchNewOrders(): Promise<IncomingOrderItem[]>
  fetchReturnedOrders(): Promise<ReturnedOrderInfo[]>
  fetchPurchaseDecidedOrders(): Promise<PurchaseDecidedInfo[]>
  fetchPaidOrdersInWindow(hoursBack: number): Promise<IncomingOrderItem[]>
  fetchPaidOrdersForDay(dateKST: string): Promise<IncomingOrderItem[]>
  confirmOrder(productOrderId: string): Promise<void>
  dispatchOrder(productOrderId: string): Promise<void>
}
