import { ExpenseCategory } from '@prisma/client'
import {
  findExpenses,
  findExpenseById,
  createExpense as createRepo,
  updateExpense as updateRepo,
  deleteExpense as deleteRepo,
  sumExpensesByCategory,
} from '../repositories/expenseRepository'

type GetExpensesInput = {
  category?: ExpenseCategory
  startDate?: Date
  endDate?: Date
  dateOrder?: 'asc' | 'desc'
  page: number
  pageSize: number
}

export async function getExpenses(input: GetExpensesInput) {
  return findExpenses(input)
}

export async function getExpenseById(id: string) {
  const expense = await findExpenseById(id)
  if (!expense) throw new Error('EXPENSE_NOT_FOUND')
  return expense
}

type CreateExpenseInput = {
  date: Date
  category: ExpenseCategory
  amount: number
  memo?: string
}

export async function createExpenseEntry(input: CreateExpenseInput) {
  return createRepo(input)
}

type UpdateExpenseInput = {
  date?: Date
  category?: ExpenseCategory
  amount?: number
  memo?: string | null
}

export async function updateExpenseEntry(id: string, input: UpdateExpenseInput) {
  await getExpenseById(id)
  return updateRepo(id, input)
}

export async function deleteExpenseEntry(id: string) {
  await getExpenseById(id)
  return deleteRepo(id)
}

export async function getExpenseSummary(startDate: Date, endDate: Date) {
  return sumExpensesByCategory(startDate, endDate)
}
