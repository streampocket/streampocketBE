import {
  IOrderSource,
  IncomingOrderItem,
  ReturnedOrderInfo,
  PurchaseDecidedInfo,
} from './IOrderSource'

export const ownPlatformOrderSource: IOrderSource = {
  async fetchNewOrders(): Promise<IncomingOrderItem[]> {
    // TODO: 자체 플랫폼 웹훅 기반 주문 수집 (추후 구현)
    return []
  },

  async fetchReturnedOrders(): Promise<ReturnedOrderInfo[]> {
    // TODO: 자체 플랫폼 반품 조회 (추후 구현)
    return []
  },

  async fetchPurchaseDecidedOrders(): Promise<PurchaseDecidedInfo[]> {
    // TODO: 자체 플랫폼 구매확정 조회 (추후 구현)
    return []
  },

  async confirmOrder(_productOrderId: string): Promise<void> {
    // TODO: 자체 플랫폼 발주 확인 (추후 구현)
  },

  async dispatchOrder(_productOrderId: string): Promise<void> {
    // TODO: 자체 플랫폼 발송 처리 (추후 구현)
  },
}
