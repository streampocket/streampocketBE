import { IOrderSource, IncomingOrderItem } from './IOrderSource'

export class NaverOrderSource implements IOrderSource {
  async fetchNewOrders(): Promise<IncomingOrderItem[]> {
    // TODO: 네이버 Commerce API 폴링 구현
    return []
  }

  async confirmOrder(_productOrderId: string): Promise<void> {
    // TODO: 네이버 발주 확인 API 호출
  }

  async dispatchOrder(_productOrderId: string): Promise<void> {
    // TODO: 네이버 발송 처리 API 호출
  }
}
