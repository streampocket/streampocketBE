import { Request, Response } from 'express'
import { z } from 'zod'
import {
  getOrders,
  getOrderCounts,
  getOrderDetail,
  retryOrder,
  markOrderInProgress,
  extendOrderEstimatedTime,
  manualCompleteOrder,
  manualReturnOrder,
  exportOrdersForExcel,
  updateFriendLinks,
  sendOrderStatusNotification,
  createManualOrder,
  deleteManualOrder,
  updateManualOrderNetProfit,
} from '../services/steamOrderService'
import { buildOrderExcelBuffer } from '../utils/excel'

const fulfillmentStatusEnum = z.enum([
  'pending',
  'in_progress',
  'completed',
  'purchase_decided',
  'manual_review',
  'failed',
  'returned',
])

const orderSourceEnum = z.enum(['naver', 'manual'])
const storeEnum = z.enum(['streampocket', 'pokemon_steam'])

const listQuerySchema = z.object({
  status: fulfillmentStatusEnum.optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  receiverName: z.string().trim().optional(),
  excludeStatuses: z
    .string()
    .optional()
    .transform((s) => (s ? s.split(',').filter(Boolean) : undefined))
    .pipe(z.array(fulfillmentStatusEnum).optional()),
  excludeWithExpense: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  source: orderSourceEnum.optional(),
  store: storeEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export async function getOrdersHandler(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query)
  const from = query.from ? new Date(query.from) : undefined
  const to = query.to ? new Date(query.to) : undefined
  const [result, counts] = await Promise.all([
    getOrders({
      status: query.status,
      from,
      to,
      receiverName: query.receiverName,
      excludeStatuses: query.excludeStatuses,
      excludeWithExpense: query.excludeWithExpense,
      source: query.source,
      store: query.store,
      page: query.page,
      pageSize: query.pageSize,
    }),
    getOrderCounts({ from, to, receiverName: query.receiverName, source: query.source, store: query.store }),
  ])
  res.json({
    data: result.items,
    total: result.total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.ceil(result.total / query.pageSize),
    counts,
  })
}

export async function getOrderDetailHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  const order = await getOrderDetail(id)
  res.json({ data: order })
}

const exportQuerySchema = z.object({
  status: fulfillmentStatusEnum.optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  source: orderSourceEnum.optional(),
})

export async function exportOrdersHandler(req: Request, res: Response): Promise<void> {
  const query = exportQuerySchema.parse(req.query)
  const orders = await exportOrdersForExcel({
    status: query.status,
    from: query.from ? new Date(query.from) : undefined,
    to: query.to ? new Date(query.to) : undefined,
    source: query.source,
  })
  const buffer = buildOrderExcelBuffer(orders)
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="orders_${date}.xlsx"`)
  res.send(buffer)
}

export async function retryOrderHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  await retryOrder(id)
  res.json({ message: '재시도 완료' })
}

export async function markInProgressHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  await markOrderInProgress(id)
  res.json({ message: '진행중으로 전환되었습니다.' })
}

export async function extendOrderTimeHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  await extendOrderEstimatedTime(id)
  res.json({ message: '예상 완료시각이 10분 연장되었습니다.' })
}

export async function manualCompleteHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  await manualCompleteOrder(id)
  res.json({ message: '완료 처리되었습니다.' })
}

export async function manualReturnHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  await manualReturnOrder(id)
  res.json({ message: '반품 처리 완료' })
}

const friendLinksBodySchema = z.object({
  friendLink1: z.string().trim().max(500).nullable().optional(),
  friendLink2: z.string().trim().max(500).nullable().optional(),
  giftCode: z.string().trim().max(200).nullable().optional(),
  gameUrl: z.string().trim().max(500).nullable().optional(),
  memo: z.string().max(1000).nullable().optional(),
})

export async function updateFriendLinksHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  const body = friendLinksBodySchema.parse(req.body)
  await updateFriendLinks(id, body)
  res.json({ message: '친구 링크가 저장되었습니다.' })
}

export async function sendOrderStatusAlimtalkHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  await sendOrderStatusNotification(id)
  res.json({ message: '주문상황 알림톡이 발송되었습니다.' })
}

// 상태(대기 고정)·결제일시(생성 시각)는 서버가 자동 설정한다.
const createManualOrderBodySchema = z.object({
  productName: z.string().trim().min(1).max(255),
  receiverName: z.string().trim().min(1).max(100),
  netProfit: z.number().int().min(0),
})

export async function createManualOrderHandler(req: Request, res: Response): Promise<void> {
  const body = createManualOrderBodySchema.parse(req.body)
  const order = await createManualOrder({
    productName: body.productName,
    receiverName: body.receiverName,
    netProfit: body.netProfit,
  })
  res.status(201).json({ data: order })
}

const deleteManualOrderParamsSchema = z.object({
  id: z.string().uuid(),
})

export async function deleteManualOrderHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = deleteManualOrderParamsSchema.parse(req.params)
  await deleteManualOrder(id)
  res.json({ message: '수동 주문이 삭제되었습니다.' })
}

const updateNetProfitParamsSchema = z.object({ id: z.string().uuid() })
const updateNetProfitBodySchema = z.object({ netProfit: z.number().int().min(0) })

export async function updateManualOrderNetProfitHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = updateNetProfitParamsSchema.parse(req.params)
  const { netProfit } = updateNetProfitBodySchema.parse(req.body)
  await updateManualOrderNetProfit(id, netProfit)
  res.json({ message: '순수익이 수정되었습니다.' })
}
