import { prisma } from '../lib/prisma'
import { ExpenseCategory, ExpensePayer, Prisma, Store } from '@prisma/client'

const steamOrderItemInclude = {
  select: {
    id: true,
    productOrderId: true,
    productName: true,
    receiverName: true,
    paidAt: true,
  },
} as const

type FindExpensesParams = {
  category?: ExpenseCategory
  startDate?: Date
  endDate?: Date
  dateOrder?: 'asc' | 'desc'
  store?: Store
  page: number
  pageSize: number
}

export async function findExpenses(params: FindExpensesParams) {
  const { category, startDate, endDate, dateOrder = 'desc', store, page, pageSize } = params

  const where: Prisma.ExpenseWhereInput = {}
  if (category) where.category = category
  if (store) where.store = store
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
      include: { steamOrderItem: steamOrderItemInclude },
    }),
    prisma.expense.count({ where }),
  ])

  return { items, total }
}

export async function findExpenseById(id: string) {
  return prisma.expense.findUnique({
    where: { id },
    include: { steamOrderItem: steamOrderItemInclude },
  })
}

export async function findExpenseBySteamOrderItemId(steamOrderItemId: string) {
  return prisma.expense.findUnique({ where: { steamOrderItemId } })
}

type CreateExpenseData = {
  store?: Store | null
  date: Date
  category: ExpenseCategory
  payer: ExpensePayer
  amount: number
  memo?: string
  steamOrderItemId?: string | null
}

export async function createExpense(data: CreateExpenseData) {
  return prisma.expense.create({
    data,
    include: { steamOrderItem: steamOrderItemInclude },
  })
}

type UpdateExpenseData = {
  date?: Date
  category?: ExpenseCategory
  payer?: ExpensePayer
  amount?: number
  memo?: string | null
  steamOrderItemId?: string | null
  store?: Store | null
}

export async function updateExpense(id: string, data: UpdateExpenseData) {
  return prisma.expense.update({
    where: { id },
    data,
    include: { steamOrderItem: steamOrderItemInclude },
  })
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } })
}

export async function findExpensesByDateRange(startOfDay: Date, endOfDay: Date) {
  return prisma.expense.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function sumExpensesByCategory(startDate: Date, endDate: Date, store?: Store) {
  const results = await prisma.expense.groupBy({
    by: ['category'],
    _sum: { amount: true },
    where: { date: { gte: startDate, lte: endDate }, ...(store ? { store } : {}) },
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
