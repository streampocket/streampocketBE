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
  const startDate = new Date(Date.UTC(year!, month! - 1, 1))
  const lastDay = new Date(Date.UTC(year!, month!, 0)).getUTCDate()
  const endDate = new Date(Date.UTC(year!, month! - 1, lastDay, 23, 59, 59, 999))
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
  const expense = await createExpenseEntry({
    date: new Date(body.date),
    category: body.category,
    amount: body.amount,
    memo: body.memo,
  })
  res.status(201).json({ data: expense })
}

export async function updateExpenseHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const body = expenseUpdateBodySchema.parse(req.body)
  const expense = await updateExpenseEntry(id, {
    ...body,
    date: body.date ? new Date(body.date) : undefined,
  })
  res.json({ data: expense })
}

export async function deleteExpenseHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  await deleteExpenseEntry(id)
  res.json({ data: { message: 'ok' } })
}
