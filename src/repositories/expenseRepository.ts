import { prisma } from '../lib/prisma'
import { ExpenseCategory, Prisma } from '@prisma/client'

type FindExpensesParams = {
  category?: ExpenseCategory
  startDate?: Date
  endDate?: Date
  dateOrder?: 'asc' | 'desc'
  page: number
  pageSize: number
}

export async function findExpenses(params: FindExpensesParams) {
  const { category, startDate, endDate, dateOrder = 'desc', page, pageSize } = params

  const where: Prisma.ExpenseWhereInput = {}
  if (category) where.category = category
  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = startDate
    if (endDate) where.date.lte = endDate
  }

  const [items, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { date: dateOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.expense.count({ where }),
  ])

  return { items, total }
}

export async function findExpenseById(id: string) {
  return prisma.expense.findUnique({ where: { id } })
}

type CreateExpenseData = {
  date: Date
  category: ExpenseCategory
  amount: number
  memo?: string
}

export async function createExpense(data: CreateExpenseData) {
  return prisma.expense.create({ data })
}

type UpdateExpenseData = {
  date?: Date
  category?: ExpenseCategory
  amount?: number
  memo?: string | null
}

export async function updateExpense(id: string, data: UpdateExpenseData) {
  return prisma.expense.update({ where: { id }, data })
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } })
}

export async function sumExpensesByCategory(startDate: Date, endDate: Date) {
  const results = await prisma.expense.groupBy({
    by: ['category'],
    _sum: { amount: true },
    where: { date: { gte: startDate, lte: endDate } },
  })

  const map: Record<string, number> = {}
  for (const r of results) {
    map[r.category] = r._sum.amount ?? 0
  }

  return {
    gamePurchase: map['game_purchase'] ?? 0,
    countryChange: map['country_change'] ?? 0,
    reviewGame: map['review_game'] ?? 0,
    other: map['other'] ?? 0,
  }
}
