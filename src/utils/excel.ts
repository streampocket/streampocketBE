import * as XLSX from 'xlsx'
import type { FulfillmentStatus, AccountStatus, SteamOrderItem } from '@prisma/client'

type AccountExportRow = {
  productName: string
  username: string
  password: string
  email: string
  emailPassword: string
  emailSiteUrl: string
  secondaryEmail: string | null
  secondaryEmailPassword: string | null
  status: AccountStatus
  sentAt: Date | null
  createdAt: Date
}

const ORDER_STATUS_KO: Record<FulfillmentStatus, string> = {
  pending: '처리 전',
  completed: '완료',
  manual_review: '수동 검토',
  failed: '실패',
  returned: '반품',
}

const ACCOUNT_STATUS_KO: Record<AccountStatus, string> = {
  available: '사용 가능',
  reserved: '선점됨',
  sent: '발송 완료',
  disabled: '비활성화',
}

function formatDate(date: Date | null): string {
  if (!date) return ''
  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function buildOrderExcelBuffer(orders: SteamOrderItem[]): Buffer {
  const header = [
    '상품주문번호',
    '네이버주문번호',
    '상품명',
    '수신자명',
    '수신전화번호',
    '결제금액',
    '상태',
    '오류메시지',
    '결제일시',
    '등록일시',
  ]

  const rows = orders.map((o) => [
    o.productOrderId,
    o.naverOrderId,
    o.productName,
    o.receiverName ?? '',
    o.receiverPhoneNumber ?? '',
    o.unitPrice,
    ORDER_STATUS_KO[o.fulfillmentStatus],
    o.errorMessage ?? '',
    formatDate(o.paidAt),
    formatDate(o.createdAt),
  ])

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '주문 목록')

  // 단언 사유: xlsx write()는 type:'buffer' 지정 시 Buffer를 반환하나 반환 타입이 any
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}

export function buildAccountExcelBuffer(accounts: AccountExportRow[]): Buffer {
  const header = ['상품명', '아이디', '비밀번호', '이메일', '이메일비번', '이메일사이트', '2차이메일', '2차이메일비번', '상태', '발송일시', '등록일시']

  const rows = accounts.map((a) => [
    a.productName,
    a.username,
    a.password,
    a.email,
    a.emailPassword,
    a.emailSiteUrl,
    a.secondaryEmail ?? '',
    a.secondaryEmailPassword ?? '',
    ACCOUNT_STATUS_KO[a.status],
    formatDate(a.sentAt),
    formatDate(a.createdAt),
  ])

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '계정 목록')

  // 단언 사유: xlsx write()는 type:'buffer' 지정 시 Buffer를 반환하나 반환 타입이 any
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}
