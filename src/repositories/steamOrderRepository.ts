import { prisma } from '../lib/prisma'
import { DeliveryChannel, DeliveryLogStatus, FulfillmentStatus, SteamOrderItem } from '@prisma/client'

type CreateOrderItemInput = {
  productOrderId: string
  naverOrderId: string
  productName: string
  unitPrice: number
  paymentAmount?: number | null
  receiverPhoneNumber?: string
  receiverName?: string
  productId?: string
  paidAt?: Date
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
  settlementAmount?: number
  paymentAmount?: number
  friendLink1?: string | null
  friendLink2?: string | null
  giftCode?: string | null
  gameUrl?: string | null
  memo?: string | null
  orderStatusAlimtalkSentAt?: Date
  estimatedCompletedAt?: Date | null
  completedAt?: Date | null
}

type ListOrdersInput = {
  status?: FulfillmentStatus
  from?: Date
  to?: Date
  receiverName?: string
  excludeStatuses?: FulfillmentStatus[]
  excludeWithExpense?: boolean
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
export async function findInProgressGiftOrders(): Promise<
  { id: string; giftCode: string | null; productName: string; receiverName: string | null }[]
> {
  return prisma.steamOrderItem.findMany({
    where: { fulfillmentStatus: 'in_progress', giftCode: { not: null } },
    select: { id: true, giftCode: true, productName: true, receiverName: true },
  })
}

export async function listOrdersPaidBetween(
  from: Date,
  to: Date,
): Promise<{ productOrderId: string; fulfillmentStatus: FulfillmentStatus }[]> {
  return prisma.steamOrderItem.findMany({
    where: { paidAt: { gte: from, lt: to } },
    select: { productOrderId: true, fulfillmentStatus: true },
  })
}

export async function createOrderItem(data: CreateOrderItemInput): Promise<SteamOrderItem> {
  return prisma.steamOrderItem.create({ data })
}

export async function updateOrderItem(
  id: string,
  data: UpdateOrderItemInput,
): Promise<SteamOrderItem> {
  return prisma.steamOrderItem.update({ where: { id }, data })
}

export async function updateReviewGameSentAt(id: string): Promise<SteamOrderItem> {
  return prisma.steamOrderItem.update({
    where: { id },
    data: { reviewGameSentAt: new Date() },
  })
}
