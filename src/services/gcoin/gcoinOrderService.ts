import type { GcoinOrderStatus } from '@prisma/client'
import {
  createGcoinOrder,
  findGcoinOrderById,
  findPendingOrderByPhoneAndProduct,
  findGcoinOrdersByPhone,
  findAllGcoinOrders,
  countGcoinOrdersByStatus,
  generateGcoinOrderNo,
  approveGcoinOrderTx,
  rejectGcoinOrder,
  linkSteamOrderItem,
} from '../../repositories/gcoin/gcoinOrderRepository'
import { findGcoinProductById } from '../../repositories/gcoin/gcoinProductRepository'
import { createGcoinOrderItem } from '../../repositories/steamOrderRepository'
import { sendDiscordAlert } from '../../lib/discord'
import {
  sendAlimtalkMessage,
  getEnvConfig,
  getActiveTemplateOrThrow,
  applyTemplate,
} from '../alimtalkService'

const GCOIN_ALIMTALK_STORE = 'pokemon_steam' as const

function formatPrice(amount: number): string {
  return amount.toLocaleString('ko-KR')
}

/**
 * 주문 접수 알림톡 (UJ_4753 "pubgcode 결제안내") — 포켓몬스팀 계정으로 발송.
 * 실패해도 주문 생성을 막지 않는다 (로그 + Discord 에러 알림, 카톡 상담으로 복구 가능).
 */
async function sendGcoinOrderAlimtalk(input: {
  buyerPhone: string
  productName: string
  salePrice: number
  orderNo: string
}): Promise<void> {
  // 개발 모드: 콘솔 출력만 (인증번호와 동일 패턴)
  if (process.env.NODE_ENV === 'development') {
    console.info(
      `[DEV] GCOIN 결제안내 알림톡: ${input.productName} / ${formatPrice(input.salePrice)}원 (phone: ${input.buyerPhone}, orderNo: ${input.orderNo})`,
    )
    return
  }

  const templateCode = process.env.ALIGO_TEMPLATE_CODE_GCOIN_ORDER_POKEMON
  if (!templateCode) {
    throw new Error('ALIGO_TEMPLATE_CODE_GCOIN_ORDER_POKEMON 환경변수가 설정되지 않았습니다.')
  }

  const config = getEnvConfig(GCOIN_ALIMTALK_STORE)
  const template = await getActiveTemplateOrThrow(config, templateCode)
  const templateContent = template.templateContent ?? ''
  const message = applyTemplate(templateContent, {
    상품명: input.productName,
    가격: formatPrice(input.salePrice),
  })

  await sendAlimtalkMessage(
    {
      templateCode,
      recipientPhoneNumber: input.buyerPhone,
      recipientName: null,
      message,
    },
    GCOIN_ALIMTALK_STORE,
  )
}

/** 전화번호 마스킹 — 디스코드 알림용 (010-1234-5678 → 010-****-5678) */
function maskPhone(phone: string): string {
  if (phone.length < 8) return phone
  return `${phone.slice(0, 3)}-****-${phone.slice(-4)}`
}

// ───────────────────────── 구매자 ─────────────────────────

export async function createBuyerGcoinOrder(buyerPhone: string, productId: string) {
  const product = await findGcoinProductById(productId)
  if (!product || product.deletedAt || product.status === 'hidden') {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (product.status === 'sold_out') {
    throw Object.assign(new Error('품절된 상품입니다.'), { statusCode: 400 })
  }

  const duplicate = await findPendingOrderByPhoneAndProduct(buyerPhone, productId)
  if (duplicate) {
    throw Object.assign(
      new Error('이미 신청한 상품입니다. 카카오톡으로 결제 안내를 확인해주세요.'),
      { statusCode: 409 },
    )
  }

  const orderNo = await generateGcoinOrderNo()
  const order = await createGcoinOrder({
    orderNo,
    productId,
    productName: product.name,
    gcoinAmount: product.gcoinAmount,
    salePrice: product.salePrice,
    quantity: 1,
    buyerPhone,
  })

  // 알림 실패가 주문 생성을 막지 않도록 격리
  sendDiscordAlert(
    'gcoin',
    [
      '🛒 **신규 주문 신청**',
      `상품: ${product.name}`,
      `금액: ${formatPrice(product.salePrice)}원`,
      `전화번호: ${maskPhone(buyerPhone)}`,
      `주문번호: ${orderNo}`,
      '',
      '카카오톡으로 결제 안내를 진행해주세요.',
    ].join('\n'),
  ).catch((err) => console.error('[GCOIN_ORDER] Discord 알림 실패', err))

  // 구매자에게 결제안내 알림톡 (UJ_4753) — 실패해도 주문 유지, 에러 채널로 통지
  sendGcoinOrderAlimtalk({
    buyerPhone,
    productName: product.name,
    salePrice: product.salePrice,
    orderNo,
  }).catch((err) => {
    console.error(`[GCOIN_ORDER] 결제안내 알림톡 발송 실패 orderNo=${orderNo}`, err)
    sendDiscordAlert(
      'error',
      `[배그] 주문 접수는 완료됐으나 결제안내 알림톡 발송에 실패했습니다. 카톡으로 직접 안내 필요\n주문번호: ${orderNo} / ${maskPhone(buyerPhone)}`,
    ).catch(() => undefined)
  })

  return order
}

export async function getBuyerGcoinOrders(buyerPhone: string) {
  const items = await findGcoinOrdersByPhone(buyerPhone)
  return { data: items }
}

// ───────────────────────── 관리자 ─────────────────────────

type AdminListFilters = {
  status?: GcoinOrderStatus
  search?: string
  page: number
  pageSize: number
}

export async function adminGetGcoinOrders(filters: AdminListFilters) {
  const [result, counts] = await Promise.all([
    findAllGcoinOrders(filters),
    countGcoinOrdersByStatus(),
  ])
  return {
    data: result.items,
    total: result.total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.ceil(result.total / filters.pageSize),
    counts,
  }
}

async function getPendingOrderOrThrow(id: string) {
  const order = await findGcoinOrderById(id)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (order.status !== 'pending') {
    throw Object.assign(new Error('대기 상태의 주문만 처리할 수 있습니다.'), { statusCode: 400 })
  }
  return order
}

export async function adminApproveGcoinOrder(id: string) {
  const order = await getPendingOrderOrThrow(id)

  const approved = await approveGcoinOrderTx(order.id, order.productId)

  // 통합 주문관리 편입 — 실패해도 승인은 유지 (파티 패턴, 수동 보정 가능)
  try {
    const orderItem = await createGcoinOrderItem({
      productOrderId: order.orderNo,
      productName: order.productName,
      receiverPhoneNumber: order.buyerPhone,
      paidAt: new Date(),
    })
    await linkSteamOrderItem(order.id, orderItem.id)
  } catch (err) {
    console.error(`[GCOIN_ORDER] 통합 주문 편입 실패 orderNo=${order.orderNo}`, err)
    sendDiscordAlert(
      'error',
      `[배그] 주문 승인은 완료됐으나 통합 주문관리 편입에 실패했습니다. 수동 확인 필요\n주문번호: ${order.orderNo}`,
    ).catch(() => undefined)
  }

  sendDiscordAlert(
    'gcoin',
    [
      '✅ **주문 승인**',
      `상품: ${order.productName}`,
      `금액: ${formatPrice(order.salePrice)}원`,
      `주문번호: ${order.orderNo}`,
      '통합 주문관리에 편입되었습니다. 순수익을 입력해주세요.',
    ].join('\n'),
  ).catch((err) => console.error('[GCOIN_ORDER] Discord 알림 실패', err))

  return approved
}

export async function adminRejectGcoinOrder(id: string, reason: string | null) {
  const order = await getPendingOrderOrThrow(id)
  return rejectGcoinOrder(order.id, reason)
}
