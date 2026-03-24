import { prisma } from '../lib/prisma'
import { FulfillmentStatus, SteamOrderItem } from '@prisma/client'

type CreateOrderItemInput = {
  productOrderId: string
  naverOrderId: string
  productName: string
  unitPrice: number
  buyerEmail?: string
  productId?: string
  paidAt?: Date
}

type UpdateOrderItemInput = {
  fulfillmentStatus?: FulfillmentStatus
  codeId?: string
  buyerEmail?: string
  productId?: string
  errorMessage?: string
}

type ListOrdersInput = {
  status?: FulfillmentStatus
  from?: Date
  to?: Date
  page: number
  pageSize: number
}

type ListOrdersResult = {
  items: SteamOrderItem[]
  total: number
}

type OrderItemWithRelations = SteamOrderItem & {
  emailLogs: {
    id: string
    recipientEmail: string
    status: string
    errorMessage: string | null
    sentAt: Date | null
    createdAt: Date
  }[]
}

export async function listOrders(input: ListOrdersInput): Promise<ListOrdersResult> {
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
  const [items, total] = await prisma.$transaction([
    prisma.steamOrderItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.steamOrderItem.count({ where }),
  ])
  return { items, total }
}

export async function findOrderById(id: string): Promise<OrderItemWithRelations | null> {
  return prisma.steamOrderItem.findUnique({
    where: { id },
    include: {
      emailLogs: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          recipientEmail: true,
          status: true,
          errorMessage: true,
          sentAt: true,
          createdAt: true,
        },
      },
    },
  })
}

export async function findOrderByProductOrderId(
  productOrderId: string,
): Promise<SteamOrderItem | null> {
  return prisma.steamOrderItem.findUnique({ where: { productOrderId } })
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
