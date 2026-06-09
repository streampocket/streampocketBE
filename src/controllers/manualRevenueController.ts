import { Request, Response } from 'express'
import { z } from 'zod'
import {
  getManualRevenues,
  createManualRevenueEntry,
  updateManualRevenueEntry,
  deleteManualRevenueEntry,
} from '../services/manualRevenueService'
import { sumManualRevenue } from '../repositories/manualRevenueRepository'

// store 미지정 = 전체(공통 포함). 지정 시 해당 store만(공통 제외).
const storeQuerySchema = z.enum(['streampocket', 'pokemon_steam']).optional()

const listQuerySchema = z.object({
  yearMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
  dateOrder: z.enum(['asc', 'desc']).default('desc'),
  store: storeQuerySchema,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

// store: 수동매출의 사업 귀속. null/미지정 = 공통(전사).
const storeSchema = z.enum(['streampocket', 'pokemon_steam']).nullable().optional()

const bodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.number().int().min(0),
  memo: z.string().max(500).optional(),
  store: storeSchema,
})

const updateBodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  amount: z.number().int().min(0).optional(),
  memo: z.string().max(500).nullable().optional(),
})

const idParamSchema = z.object({
  id: z.string().uuid(),
})

const summaryQuerySchema = z.object({
  yearMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
  store: storeQuerySchema,
})

function yearMonthToRange(yearMonth: string): { startDate: Date; endDate: Date } {
  const [year, month] = yearMonth.split('-').map(Number)
  const startDate = new Date(Date.UTC(year!, month! - 1, 1))
  const lastDay = new Date(Date.UTC(year!, month!, 0)).getUTCDate()
  const endDate = new Date(Date.UTC(year!, month! - 1, lastDay, 23, 59, 59, 999))
  return { startDate, endDate }
}

export async function getManualRevenuesHandler(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query)

  let startDate: Date | undefined
  let endDate: Date | undefined
  if (query.yearMonth) {
    const range = yearMonthToRange(query.yearMonth)
    startDate = range.startDate
    endDate = range.endDate
  }

  const result = await getManualRevenues({
    startDate,
    endDate,
    dateOrder: query.dateOrder,
    store: query.store,
    page: query.page,
    pageSize: query.pageSize,
  })

  res.json({
    data: result.items,
    meta: {
      total: result.total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(result.total / query.pageSize),
    },
  })
}

export async function getManualRevenueSummaryHandler(req: Request, res: Response): Promise<void> {
  const { yearMonth, store } = summaryQuerySchema.parse(req.query)

  const now = new Date()
  const ym = yearMonth ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const { startDate, endDate } = yearMonthToRange(ym)

  const total = await sumManualRevenue(startDate, endDate, store)
  res.json({ data: { total } })
}

export async function createManualRevenueHandler(req: Request, res: Response): Promise<void> {
  const body = bodySchema.parse(req.body)
  const item = await createManualRevenueEntry({
    date: new Date(body.date),
    amount: body.amount,
    memo: body.memo,
    store: body.store ?? null,
  })
  res.status(201).json({ data: item })
}

export async function updateManualRevenueHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const body = updateBodySchema.parse(req.body)
  const item = await updateManualRevenueEntry(id, {
    ...body,
    date: body.date ? new Date(body.date) : undefined,
  })
  res.json({ data: item })
}

export async function deleteManualRevenueHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  await deleteManualRevenueEntry(id)
  res.json({ data: { message: 'ok' } })
}
