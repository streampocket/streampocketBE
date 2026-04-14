import { Request, Response } from 'express'
import { z } from 'zod'
import { ExpenseCategory } from '@prisma/client'
import {
  getExpenses,
  createExpenseEntry,
  updateExpenseEntry,
  deleteExpenseEntry,
} from '../services/expenseService'
import { getRevenueSummary } from '../services/steamDashboardService'

const expenseCategorySchema = z.nativeEnum(ExpenseCategory)

const expenseListQuerySchema = z.object({
  category: expenseCategorySchema.optional(),
  yearMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
  dateOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

const expenseBodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: expenseCategorySchema,
  amount: z.number().int().min(0),
  memo: z.string().max(500).optional(),
})

const expenseUpdateBodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category: expenseCategorySchema.optional(),
  amount: z.number().int().min(0).optional(),
  memo: z.string().max(500).nullable().optional(),
})

const idParamSchema = z.object({
  id: z.string().uuid(),
})

const summaryQuerySchema = z.object({
  yearMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
})

function yearMonthToRange(yearMonth: string): { startDate: Date; endDate: Date } {
  const [year, month] = yearMonth.split('-').map(Number)
  const lastDay = new Date(Date.UTC(year!, month!, 0)).getUTCDate()
  const mm = String(month).padStart(2, '0')
  // KST 기준 월의 시작~끝
  const startDate = new Date(`${year}-${mm}-01T00:00:00.000+09:00`)
  const endDate = new Date(`${year}-${mm}-${String(lastDay).padStart(2, '0')}T23:59:59.999+09:00`)
  return { startDate, endDate }
}

export async function getExpensesHandler(req: Request, res: Response): Promise<void> {
  const query = expenseListQuerySchema.parse(req.query)

  let startDate: Date | undefined
  let endDate: Date | undefined
  if (query.yearMonth) {
    const range = yearMonthToRange(query.yearMonth)
    startDate = range.startDate
    endDate = range.endDate
  }

  const result = await getExpenses({
    category: query.category,
    startDate,
    endDate,
    dateOrder: query.dateOrder,
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

export async function getExpenseSummaryHandler(req: Request, res: Response): Promise<void> {
  const { yearMonth } = summaryQuerySchema.parse(req.query)

  const now = new Date()
  const ym = yearMonth ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const { startDate, endDate } = yearMonthToRange(ym)

  const summary = await getRevenueSummary(startDate, endDate)
  res.json({ data: summary })
}

export async function createExpenseHandler(req: Request, res: Response): Promise<void> {
  const body = expenseBodySchema.parse(req.body)

  // 사용자가 선택한 날짜 + 현재 KST 시간 결합
  const now = new Date()
  const [year, month, day] = body.date.split('-').map(Number)
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const date = new Date(
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(kstNow.getUTCHours()).padStart(2, '0')}:${String(kstNow.getUTCMinutes()).padStart(2, '0')}:${String(kstNow.getUTCSeconds()).padStart(2, '0')}+09:00`,
  )

  const expense = await createExpenseEntry({
    date,
    category: body.category,
    amount: body.amount,
    memo: body.memo,
  })
  res.status(201).json({ data: expense })
}

export async function updateExpenseHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const body = expenseUpdateBodySchema.parse(req.body)

  let date: Date | undefined
  if (body.date) {
    const now = new Date()
    const [year, month, day] = body.date.split('-').map(Number)
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    date = new Date(
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(kstNow.getUTCHours()).padStart(2, '0')}:${String(kstNow.getUTCMinutes()).padStart(2, '0')}:${String(kstNow.getUTCSeconds()).padStart(2, '0')}+09:00`,
    )
  }

  const expense = await updateExpenseEntry(id, {
    ...body,
    date,
  })
  res.json({ data: expense })
}

export async function deleteExpenseHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  await deleteExpenseEntry(id)
  res.json({ data: { message: 'ok' } })
}
