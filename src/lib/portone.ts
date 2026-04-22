const PORTONE_V2_BASE_URL = process.env.PORTONE_V2_BASE_URL ?? 'https://api.portone.io'

function getApiSecret(): string {
  const secret = process.env.PORTONE_V2_API_SECRET
  if (!secret) {
    throw Object.assign(new Error('PORTONE_V2_API_SECRET 환경변수가 설정되지 않았습니다.'), {
      statusCode: 500,
    })
  }
  return secret
}

export type PortOnePaymentStatus =
  | 'READY'
  | 'PENDING'
  | 'VIRTUAL_ACCOUNT_ISSUED'
  | 'PAID'
  | 'FAILED'
  | 'PARTIAL_CANCELLED'
  | 'CANCELLED'

export type PortOnePayment = {
  id: string
  status: PortOnePaymentStatus
  transactionId?: string | null
  channel?: {
    id?: string
    type?: string
    pgProvider?: string
  }
  amount: {
    total: number
    paid?: number
  }
  currency: string
  method?: {
    type?: string
    provider?: string
    easyPay?: {
      provider?: string
    }
  }
  orderName?: string
  paidAt?: string | null
  failedAt?: string | null
  cancelledAt?: string | null
}

export async function getPaymentFromPortOne(paymentId: string): Promise<PortOnePayment> {
  const url = `${PORTONE_V2_BASE_URL}/payments/${encodeURIComponent(paymentId)}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `PortOne ${getApiSecret()}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw Object.assign(
      new Error(`포트원 결제 조회 실패 (${response.status}): ${body.slice(0, 200)}`),
      { statusCode: 502 },
    )
  }

  return (await response.json()) as PortOnePayment
}

export async function cancelPaymentOnPortOne(
  paymentId: string,
  reason: string,
): Promise<PortOnePayment> {
  const url = `${PORTONE_V2_BASE_URL}/payments/${encodeURIComponent(paymentId)}/cancel`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `PortOne ${getApiSecret()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw Object.assign(
      new Error(`포트원 결제 취소 실패 (${response.status}): ${body.slice(0, 200)}`),
      { statusCode: 502 },
    )
  }

  const data = (await response.json()) as { payment: PortOnePayment }
  return data.payment
}
