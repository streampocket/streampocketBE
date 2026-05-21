import { z } from 'zod'

// zqbg.cn 발송상태 조회 클라이언트 (AA 선물주문 자동완료용)
// 인증 불필요 공개 엔드포인트: GET /steam2/cdk/code/check?code={zqbg 주문번호}
// 기본/커스텀 주문 모두 동일 엔드포인트에서 조회된다 (라이브 검증).

const REQUEST_TIMEOUT_MS = 10_000

// 검증된 발송 status 값 (공급처 공식문서 부재 — 직접 관찰로 확인)
export const ZQBG_STATUS = {
  FRIEND_LINK_SUBMITTED: 7, // 提交好友链接成功 (친구링크 제출) — 진행중
  QUEUED: 5, // 排队发货中 (발송 대기열) — 진행중
  SHIPPED: 6, // 订单已发货 (발송 완료) — 완료 판정 기준
} as const

const zqbgCheckSchema = z.object({
  code: z.number(),
  success: z.boolean(),
  msg: z.string(),
  data: z
    .object({
      message: z.string(),
      status: z.number(),
    })
    .nullable(),
})

export type ZqbgCheckResult = z.infer<typeof zqbgCheckSchema>

function getBaseUrl(): string {
  const raw = process.env['ZQBG_API_BASE_URL'] ?? 'https://new.zqbg.cn'
  try {
    new URL(raw)
  } catch {
    throw new Error('ZQBG_API_BASE_URL 환경변수가 올바른 URL 형식이 아닙니다.')
  }
  return raw.replace(/\/$/, '')
}

// zqbg 주문번호로 발송 상태를 조회한다. 타임아웃·네트워크·HTTP 오류 시 throw.
export async function checkZqbgOrderStatus(orderNo: string): Promise<ZqbgCheckResult> {
  const baseUrl = getBaseUrl()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(
      `${baseUrl}/steam2/cdk/code/check?code=${encodeURIComponent(orderNo)}`,
      { method: 'GET', signal: controller.signal },
    )

    if (!res.ok) {
      throw new Error(`zqbg 발송상태 조회 실패 (${res.status})`)
    }

    return zqbgCheckSchema.parse(await res.json())
  } finally {
    clearTimeout(timeout)
  }
}
