import { ExpenseCategory, ExpensePayer } from '@prisma/client'
import {
  findExpenses,
  findExpenseById,
  createExpense as createRepo,
  updateExpense as updateRepo,
  deleteExpense as deleteRepo,
  sumExpensesByCategory,
} from '../repositories/expenseRepository'
import { sendDiscordAlert } from '../lib/discord'

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  game_purchase: '게임 구매비',
  country_change: '국가변경',
  review_game: '리뷰 게임',
  other: '기타',
}

const PAYER_LABELS: Record<ExpensePayer, string> = {
  song_donggeon: '송동건',
  im_jeongbin: '임정빈',
}

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
  payer: ExpensePayer
  amount: number
  memo?: string
}

export async function createExpenseEntry(input: CreateExpenseInput) {
  const expense = await createRepo(input)

  const perPerson = Math.round(expense.amount / 2)
  const label = CATEGORY_LABELS[expense.category]
  const payerLabel = PAYER_LABELS[expense.payer]
  const memo = expense.memo ? `\n메모: ${expense.memo}` : ''
  sendDiscordAlert(
    'expense',
    `📝 **비용 등록**\n분류: ${label}\n결제자: ${payerLabel}\n금액: ${expense.amount.toLocaleString('ko-KR')}원 (인당 ${perPerson.toLocaleString('ko-KR')}원)${memo}`,
  ).catch(() => {})

  return expense
}

type UpdateExpenseInput = {
  date?: Date
  category?: ExpenseCategory
  payer?: ExpensePayer
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
