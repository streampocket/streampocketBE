import { prisma } from '../lib/prisma'
import {
  DeliveryChannel,
  DeliveryLogStatus,
  FulfillmentStatus,
  OrderSource,
  SteamOrderItem,
  Store,
} from '@prisma/client'

type CreateOrderItemInput = {
  productOrderId: string
  naverOrderId: string
  productName: string
  unitPrice: number
  paymentAmount?: number | null
  receiverPhoneNumber?: string
  receiverName?: string
  store?: Store
  productId?: string
  gameId?: string | null
  paidAt?: Date
}

// 수동 주문 생성 입력 — 순수익(netProfit)을 unitPrice/paymentAmount/settlementAmount에 동일 저장
type CreateManualOrderItemInput = {
  productOrderId: string
  naverOrderId: string
  productName: string
  receiverName: string
  netProfit: number
  fulfillmentStatus: FulfillmentStatus
  paidAt: Date
}

type UpdateOrderItemInput = {
  fulfillmentStatus?: FulfillmentStatus
  accountId?: string
  receiverPhoneNumber?: string
  receiverName?: string
  productId?: string
  errorMessage?: string
  returnedAt?: Date | null
  decisionDate?: Date
  unitPrice?: number
  settlementAmount?: number
  paymentAmount?: number
  friendLink1?: string | null
  friendLink2?: string | null
  giftCode?: string | null
  gameUrl?: string | null
  memo?: string | null
  orderStatusAlimtalkSentAt?: Date
  estimatedCompletedAt?: Date | null
  naverDispatchedAt?: Date
  completedAt?: Date | null
}

type ListOrdersInput = {
  status?: FulfillmentStatus
  from?: Date
  to?: Date
  receiverName?: string
  excludeStatuses?: FulfillmentStatus[]
  excludeWithExpense?: boolean
  source?: OrderSource
  store?: Store
  page: number
  pageSize: number
}

type SteamOrderItemWithExpense = SteamOrderItem & {
  expense: { id: string } | null
}

type ListOrdersResult = {
  items: SteamOrderItemWithExpense[]
  total: number
}

type ExportOrdersInput = {
  status?: FulfillmentStatus
  from?: Date
  to?: Date
  source?: OrderSource
}

type OrderItemWithRelations = SteamOrderItem & {
  deliveryLogs: {
    id: string
    channel: DeliveryChannel
    recipient: string
    templateCode: string | null
    message: string | null
    status: DeliveryLogStatus
    errorMessage: string | null
    providerMessageId: string | null
    sentAt: Date | null
    createdAt: Date
  }[]
}

export async function listOrders(input: ListOrdersInput): Promise<ListOrdersResult> {
  const where = {
    ...(input.status ? { fulfillmentStatus: input.status } : {}),
    ...(input.excludeStatuses && input.excludeStatuses.length > 0
      ? { fulfillmentStatus: { notIn: input.excludeStatuses } }
      : {}),
    ...(input.from || input.to
      ? {
          createdAt: {
            ...(input.from ? { gte: input.from } : {}),
            ...(input.to ? { lte: input.to } : {}),
          },
        }
      : {}),
    ...(input.receiverName
      ? { receiverName: { contains: input.receiverName, mode: 'insensitive' as const } }
      : {}),
    ...(input.excludeWithExpense ? { expense: null } : {}),
    ...(input.source ? { source: input.source } : {}),
    ...(input.store ? { store: input.store } : {}),
  }
  const [items, total] = await prisma.$transaction([
    prisma.steamOrderItem.findMany({
      where,
      orderBy: [{ paidAt: 'desc' }, { createdAt: 'desc' }],
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      include: { expense: { select: { id: true } } },
    }),
    prisma.steamOrderItem.count({ where }),
  ])
  return { items, total }
}

type CountOrdersInput = {
  from?: Date
  to?: Date
  receiverName?: string
  source?: OrderSource
  store?: Store
}

export async function groupOrderCountsByStatus(input: CountOrdersInput) {
  const where = {
    ...(input.from || input.to
      ? {
          createdAt: {
            ...(input.from ? { gte: input.from } : {}),
            ...(input.to ? { lte: input.to } : {}),
          },
        }
      : {}),
    ...(input.receiverName
      ? { receiverName: { contains: input.receiverName, mode: 'insensitive' as const } }
      : {}),
    ...(input.source ? { source: input.source } : {}),
    ...(input.store ? { store: input.store } : {}),
  }
  return prisma.steamOrderItem.groupBy({
    by: ['fulfillmentStatus'],
    where,
    _count: { _all: true },
  })
}

export async function findOrderById(id: string): Promise<OrderItemWithRelations | null> {
  return prisma.steamOrderItem.findUnique({
    where: { id },
    include: {
      deliveryLogs: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          channel: true,
          recipient: true,
          templateCode: true,
          message: true,
          status: true,
          errorMessage: true,
          providerMessageId: true,
          sentAt: true,
          createdAt: true,
        },
      },
    },
  })
}

export async function exportOrders(input: ExportOrdersInput): Promise<SteamOrderItem[]> {
  const where = {
    ...(input.status ? { fulfillmentStatus: input.status } : {}),
    ...(input.from || input.to
      ? {
          createdAt: {
            ...(input.from ? { gte: input.from } : {}),
            ...(input.to ? { lte: input.to } : {}),
          },
        }
      : {}),
    ...(input.source ? { source: input.source } : {}),
  }
  return prisma.steamOrderItem.findMany({
    where,
    orderBy: [{ paidAt: 'desc' }, { createdAt: 'desc' }],
  })
}

export async function findOrderByProductOrderId(
  productOrderId: string,
): Promise<SteamOrderItem | null> {
  return prisma.steamOrderItem.findUnique({ where: { productOrderId } })
}

// zqbg 발송상태 폴링 대상: 진행중 + giftCode(zqbg 주문번호) 보유 주문
// source는 Discord 알림 [수동] 태깅용 (where 필터는 하지 않음 — 수동 주문도 자동완료 대상)
export async function findInProgressGiftOrders(): Promise<
  {
    id: string
    giftCode: string | null
    productName: string
    receiverName: string | null
    source: OrderSource
    store: Store | null
  }[]
> {
  return prisma.steamOrderItem.findMany({
    where: { fulfillmentStatus: 'in_progress', giftCode: { not: null } },
    select: {
      id: true,
      giftCode: true,
      productName: true,
      receiverName: true,
      source: true,
      store: true,
    },
  })
}

// 일일 대조 — 네이버 주문만 대상(수동 주문은 네이버 API에 없으므로 제외)
export async function listOrdersPaidBetween(
  from: Date,
  to: Date,
): Promise<{ productOrderId: string; fulfillmentStatus: FulfillmentStatus }[]> {
  return prisma.steamOrderItem.findMany({
    where: { source: 'naver', paidAt: { gte: from, lt: to } },
    select: { productOrderId: true, fulfillmentStatus: true },
  })
}

export async function createOrderItem(data: CreateOrderItemInput): Promise<SteamOrderItem> {
  return prisma.steamOrderItem.create({ data })
}

// 수동 주문 생성 — 순수익을 unitPrice/paymentAmount/settlementAmount에 동일 저장(수수료 없음)
export async function createManualOrderItem(
  data: CreateManualOrderItemInput,
): Promise<SteamOrderItem> {
  return prisma.steamOrderItem.create({
    data: {
      productOrderId: data.productOrderId,
      naverOrderId: data.naverOrderId,
      productName: data.productName,
      receiverName: data.receiverName,
      unitPrice: data.netProfit,
      paymentAmount: data.netProfit,
      settlementAmount: data.netProfit,
      fulfillmentStatus: data.fulfillmentStatus,
      paidAt: data.paidAt,
      source: 'manual',
      // 수동주문은 스토어 무귀속 — 매출 집계에서 "전체"에만 포함(스토어별 보기 제외). 기본값(streampocket) 덮어씀.
      store: null,
    },
  })
}

// 파티 승인 자동 주문 생성 — 수동주문과 동일하게 순수익을 3개 금액 필드에 동일 저장(수수료 없음), source='party'
export async function createPartyOrderItem(
  data: CreateManualOrderItemInput & { partyApplicationId: string },
): Promise<SteamOrderItem> {
  return prisma.steamOrderItem.create({
    data: {
      productOrderId: data.productOrderId,
      naverOrderId: data.naverOrderId,
      productName: data.productName,
      receiverName: data.receiverName,
      unitPrice: data.netProfit,
      paymentAmount: data.netProfit,
      settlementAmount: data.netProfit,
      fulfillmentStatus: data.fulfillmentStatus,
      paidAt: data.paidAt,
      source: 'party',
      partyApplicationId: data.partyApplicationId,
      // 파티 주문도 스토어 무귀속 — 수동주문과 동일하게 "전체" 매출에만 포함.
      store: null,
    },
  })
}

// 수동 주문용 상품주문번호 자동생성 — 네이버(숫자 문자열)와 충돌 방지 위해 MAN_ 접두어 사용
// 형식: MAN_<YYYYMMDDHHmmss>_<3자리 랜덤>. 고유성은 unique 제약 + 재시도로 보장
export async function generateManualProductOrderId(): Promise<string> {
  return generateProductOrderIdWithPrefix('MAN')
}

// 파티 승인 자동 주문용 상품주문번호 — 수동(MAN_)·네이버와 구분되도록 PARTY_ 접두어 사용
// 형식: PARTY_<YYYYMMDDHHmmss>_<3자리 랜덤>. 고유성은 unique 제약 + 재시도로 보장
export async function generatePartyProductOrderId(): Promise<string> {
  return generateProductOrderIdWithPrefix('PARTY')
}

// 배그(GCOIN) 주문 승인 편입 — 파티와 동일하게 순수익 0으로 시작해 3개 금액 필드 동일 저장, source='gcoin'
type CreateGcoinOrderItemInput = {
  productOrderId: string
  productName: string
  receiverPhoneNumber: string
  paidAt: Date
}

export async function createGcoinOrderItem(
  data: CreateGcoinOrderItemInput,
): Promise<SteamOrderItem> {
  return prisma.steamOrderItem.create({
    data: {
      productOrderId: data.productOrderId,
      naverOrderId: data.productOrderId,
      productName: data.productName,
      receiverPhoneNumber: data.receiverPhoneNumber,
      unitPrice: 0,
      paymentAmount: 0,
      settlementAmount: 0,
      fulfillmentStatus: 'completed',
      paidAt: data.paidAt,
      source: 'gcoin',
      // 배그 주문도 스토어 무귀속 — 수동·파티와 동일하게 "전체" 매출에만 포함.
      store: null,
    },
  })
}

async function generateProductOrderIdWithPrefix(prefix: string): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    // KST 기준 표기(ID 가독성용) — 고유성은 랜덤 접미어가 담당
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
    const ts = kst.toISOString().replace(/[-:T.]/g, '').slice(0, 14)
    const rand = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
    const candidate = `${prefix}_${ts}_${rand}`
    const existing = await prisma.steamOrderItem.findUnique({
      where: { productOrderId: candidate },
    })
    if (!existing) return candidate
  }
  throw Object.assign(new Error('주문번호 생성에 실패했습니다. 다시 시도해 주세요.'), {
    statusCode: 500,
  })
}

export async function updateOrderItem(
  id: string,
  data: UpdateOrderItemInput,
): Promise<SteamOrderItem> {
  return prisma.steamOrderItem.update({ where: { id }, data })
}

// 자동 +10분 연장 후보 조회 — in_progress + estimatedCompletedAt ≤ thresholdAt + 자동 연장 한도 미달
export async function findOrdersForAutoExtend(
  thresholdAt: Date,
  maxAutoExtendCount: number,
): Promise<
  {
    id: string
    productName: string
    receiverName: string | null
    productOrderId: string
    estimatedCompletedAt: Date | null
    autoExtendCount: number
    store: Store | null
  }[]
> {
  return prisma.steamOrderItem.findMany({
    where: {
      fulfillmentStatus: 'in_progress',
      estimatedCompletedAt: { not: null, lte: thresholdAt },
      autoExtendCount: { lt: maxAutoExtendCount },
    },
    select: {
      id: true,
      productName: true,
      receiverName: true,
      productOrderId: true,
      estimatedCompletedAt: true,
      autoExtendCount: true,
      store: true,
    },
  })
}

// 자동 연장 적용 — atomic increment + estimatedCompletedAt 갱신을 한 번에
export async function incrementAutoExtendCount(
  id: string,
  newEstimatedAt: Date,
): Promise<{ autoExtendCount: number }> {
  return prisma.steamOrderItem.update({
    where: { id },
    data: {
      autoExtendCount: { increment: 1 },
      estimatedCompletedAt: newEstimatedAt,
    },
    select: { autoExtendCount: true },
  })
}

export async function deleteOrderItemById(id: string): Promise<void> {
  await prisma.steamOrderItem.delete({ where: { id } })
}

// 일일 종합 리포트용 — 당일 결제된 수동 주문(반품 제외)을 결제순으로 반환
export async function listManualOrdersPaidOn(
  start: Date,
  end: Date,
): Promise<{ productName: string; settlementAmount: number | null }[]> {
  return prisma.steamOrderItem.findMany({
    where: {
      source: 'manual',
      paidAt: { gte: start, lte: end },
      returnedAt: null,
    },
    select: { productName: true, settlementAmount: true },
    orderBy: { paidAt: 'asc' },
  })
}

// 일일 종합 리포트용 — 당일 결제된 파티 주문(반품 제외)을 결제순으로 반환 (수동주문과 별도 섹션 표시)
export async function listPartyOrdersPaidOn(
  start: Date,
  end: Date,
): Promise<{ productName: string; settlementAmount: number | null }[]> {
  return prisma.steamOrderItem.findMany({
    where: {
      source: 'party',
      paidAt: { gte: start, lte: end },
      returnedAt: null,
    },
    select: { productName: true, settlementAmount: true },
    orderBy: { paidAt: 'asc' },
  })
}

// 일일 종합 리포트용 — 당일 승인(편입)된 배그(GCOIN) 주문 (파티와 동일 패턴, 별도 섹션 표시)
export async function listGcoinOrdersPaidOn(
  start: Date,
  end: Date,
): Promise<{ productName: string; settlementAmount: number | null }[]> {
  return prisma.steamOrderItem.findMany({
    where: {
      source: 'gcoin',
      paidAt: { gte: start, lte: end },
      returnedAt: null,
    },
    select: { productName: true, settlementAmount: true },
    orderBy: { paidAt: 'asc' },
  })
}

// 리뷰게임 발송 원자적 선점 — reviewGameSentAt가 비어있고 구매확정 상태인 주문만 현재 시각으로 채운다.
// 동시 요청이 들어와도 DB 행 잠금으로 단 하나만 count===1을 받아 true를 반환하므로 중복 발송을 차단한다.
export async function claimReviewGameSend(id: string): Promise<boolean> {
  const result = await prisma.steamOrderItem.updateMany({
    where: { id, reviewGameSentAt: null, fulfillmentStatus: 'purchase_decided' },
    data: { reviewGameSentAt: new Date() },
  })
  return result.count === 1
}

// 선점 후 발송이 실패했을 때 reviewGameSentAt를 다시 null로 되돌려 재발송을 허용한다.
export async function rollbackReviewGameSend(id: string): Promise<void> {
  await prisma.steamOrderItem.update({
    where: { id },
    data: { reviewGameSentAt: null },
  })
}

// 게임 병합 — 주문의 game_id를 원 게임에서 대상 게임으로 일괄 이동(이력 일관성)
export async function reassignOrderItemsToGame(
  fromGameId: string,
  toGameId: string,
): Promise<number> {
  const result = await prisma.steamOrderItem.updateMany({
    where: { gameId: fromGameId },
    data: { gameId: toGameId },
  })
  return result.count
}
