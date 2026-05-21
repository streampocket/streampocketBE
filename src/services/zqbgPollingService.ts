import { findInProgressGiftOrders } from '../repositories/steamOrderRepository'
import { manualCompleteOrder } from './steamOrderService'
import { checkZqbgOrderStatus, ZQBG_STATUS } from '../lib/zqbgClient'
import { sendDiscordAlert } from '../lib/discord'
import { detectProductType } from '../utils/productType'

// AA 선물주문 자동완료 — 진행중 + zqbg 주문번호(giftCode) 보유 주문을 폴링하여
// 공급처가 발송완료(status 6)를 반환하면 manualCompleteOrder로 완료 처리한다.
// 완료 알림톡 발송은 manualCompleteOrder 내부 로직을 그대로 재사용한다.

export type ZqbgPollResult = {
  checked: number // 조회 시도한 주문 수
  completed: number // 자동 완료 처리된 주문 수
  pending: number // 아직 진행중(status 5/7 또는 success:false) 주문 수
  abnormal: number // 미지정 status 값 주문 수
  failed: number // 조회 호출 실패 주문 수
  skipped: boolean // 이전 회차 진행 중이라 건너뛴 경우
}

type GiftOrder = {
  id: string
  giftCode: string | null
  productName: string
  receiverName: string | null
}

// 발송완료 감지 → 자동 완료 알림 강조색 (밝은 파랑)
const DISCORD_BLUE = 0x3498db

// 안전 알림 중복 방지용 인메모리 상태 (서버 재시작 시 초기화 — 안전 알림 한정이라 허용)
type PollState = {
  firstSeenAt: number
  alertedStale: boolean
  alertedAbnormalStatus: number | null
}

const KNOWN_STATUSES: number[] = [
  ZQBG_STATUS.FRIEND_LINK_SUBMITTED,
  ZQBG_STATUS.QUEUED,
  ZQBG_STATUS.SHIPPED,
]

const STALE_ALERT_HOURS = Number(process.env['ZQBG_STALE_ALERT_HOURS'] ?? 6)

const pollState = new Map<string, PollState>()
let isPolling = false

export async function runZqbgGiftStatusPolling(): Promise<ZqbgPollResult> {
  if (isPolling) {
    return { checked: 0, completed: 0, pending: 0, abnormal: 0, failed: 0, skipped: true }
  }
  isPolling = true

  const result: ZqbgPollResult = {
    checked: 0,
    completed: 0,
    pending: 0,
    abnormal: 0,
    failed: 0,
    skipped: false,
  }

  try {
    const orders = await findInProgressGiftOrders()
    const seenIds = new Set<string>()

    for (const order of orders) {
      const orderNo = order.giftCode?.trim()
      // giftCode 없거나 AA 주문이 아니면 대상 제외 (DB 직접 입력 등 방어)
      if (!orderNo || detectProductType(order.productName) !== 'AA') continue

      seenIds.add(order.id)
      result.checked += 1

      const state = getState(order.id)

      try {
        const res = await checkZqbgOrderStatus(orderNo)

        if (res.success && res.data) {
          const status = res.data.status

          if (status === ZQBG_STATUS.SHIPPED) {
            const done = await completeOrder(order)
            if (done) {
              result.completed += 1
              pollState.delete(order.id)
              continue
            }
          } else if (KNOWN_STATUSES.includes(status)) {
            result.pending += 1
          } else {
            result.abnormal += 1
            await alertAbnormal(order, orderNo, status, res.data.message, state)
          }
        } else {
          // success:false (예: 激活码不存在 -7001) — 아직 미확정, 진행중 유지
          result.pending += 1
        }
      } catch (error) {
        result.failed += 1
        console.error(`[ZQBG_POLL] 발송상태 조회 실패 order=${order.id} code=${orderNo}`, error)
      }

      // 장시간 미완료 안전 알림 (주문당 1회)
      await maybeAlertStale(order, orderNo, state)
    }

    // 더 이상 in_progress 가 아닌 주문의 인메모리 상태 정리
    for (const id of pollState.keys()) {
      if (!seenIds.has(id)) pollState.delete(id)
    }

    return result
  } finally {
    isPolling = false
  }
}

function getState(orderId: string): PollState {
  const existing = pollState.get(orderId)
  if (existing) return existing
  const fresh: PollState = { firstSeenAt: Date.now(), alertedStale: false, alertedAbnormalStatus: null }
  pollState.set(orderId, fresh)
  return fresh
}

// 완료 처리 — 이미 완료된 주문(수동 완료 등)이면 throw → false 반환(중복 알림톡 방지)
async function completeOrder(order: GiftOrder): Promise<boolean> {
  try {
    await manualCompleteOrder(order.id)
    await sendDiscordAlert(
      'order',
      `🤖 zqbg 발송완료 감지 → 자동 완료 처리\n상품: ${order.productName}\n수신자: ${order.receiverName ?? '-'}`,
      { color: DISCORD_BLUE },
    )
    return true
  } catch (error) {
    // 이미 completed 이거나 완료 불가 상태 — 무시하되 로그
    console.error(`[ZQBG_POLL] 자동 완료 처리 스킵 order=${order.id}`, error)
    return false
  }
}

async function alertAbnormal(
  order: GiftOrder,
  orderNo: string,
  status: number,
  message: string,
  state: PollState,
): Promise<void> {
  if (state.alertedAbnormalStatus === status) return // 동일 비정상 status 중복 알림 방지
  state.alertedAbnormalStatus = status
  await sendDiscordAlert(
    'error',
    `⚠️ zqbg 미지정 발송상태\n상품: ${order.productName}\n주문번호: ${orderNo}\nstatus: ${status} (${message})\n자동완료 보류, 진행중 유지 — 수동 확인 필요`,
  )
}

async function maybeAlertStale(order: GiftOrder, orderNo: string, state: PollState): Promise<void> {
  if (state.alertedStale) return
  const hoursElapsed = (Date.now() - state.firstSeenAt) / (60 * 60 * 1000)
  if (hoursElapsed < STALE_ALERT_HOURS) return

  state.alertedStale = true
  await sendDiscordAlert(
    'error',
    `⏳ zqbg 자동완료 지연\n상품: ${order.productName}\n주문번호: ${orderNo}\n진행중 ${STALE_ALERT_HOURS}시간 경과했으나 발송완료(status 6) 미감지 — 수동 확인 필요`,
  )
}
