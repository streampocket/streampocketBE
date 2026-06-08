import { ExpenseCategory, ExpensePayer, Store } from '@prisma/client'
import {
  findExpenses,
  findExpenseById,
  findExpenseBySteamOrderItemId,
  createExpense as createRepo,
  updateExpense as updateRepo,
  deleteExpense as deleteRepo,
  sumExpensesByCategory,
} from '../repositories/expenseRepository'
import { findOrderById } from '../repositories/steamOrderRepository'
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
  store?: Store
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
  steamOrderItemId?: string | null
  store?: Store | null
}

export async function createExpenseEntry(input: CreateExpenseInput) {
  // store 결정: 주문연동 비용이면 주문의 store를 상속, 독립 비용이면 입력값(공통=null 허용)
  let store: Store | null = input.store ?? null
  if (input.steamOrderItemId) {
    const order = await assertOrderAvailableForExpense(input.steamOrderItemId, null)
    store = order.store
  }

  const expense = await createRepo({ ...input, store })

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
  steamOrderItemId?: string | null
}

export async function updateExpenseEntry(id: string, input: UpdateExpenseInput) {
  await getExpenseById(id)
  if (input.steamOrderItemId) {
    await assertOrderAvailableForExpense(input.steamOrderItemId, id)
  }
  return updateRepo(id, input)
}

async function assertOrderAvailableForExpense(
  steamOrderItemId: string,
  currentExpenseId: string | null,
) {
  const order = await findOrderById(steamOrderItemId)
  if (!order) {
    throw Object.assign(new Error('연결할 주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  const existing = await findExpenseBySteamOrderItemId(steamOrderItemId)
  if (existing && existing.id !== currentExpenseId) {
    throw Object.assign(new Error('이미 비용이 등록된 주문입니다.'), { statusCode: 409 })
  }
  return order
}

export async function deleteExpenseEntry(id: string) {
  await getExpenseById(id)
  return deleteRepo(id)
}

export async function getExpenseSummary(startDate: Date, endDate: Date, store?: Store) {
  return sumExpensesByCategory(startDate, endDate, store)
}
