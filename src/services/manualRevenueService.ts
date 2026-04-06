import {
  findManualRevenues,
  findManualRevenueById,
  createManualRevenue as createRepo,
  updateManualRevenue as updateRepo,
  deleteManualRevenue as deleteRepo,
} from '../repositories/manualRevenueRepository'

type GetManualRevenuesInput = {
  startDate?: Date
  endDate?: Date
  dateOrder?: 'asc' | 'desc'
  page: number
  pageSize: number
}

export async function getManualRevenues(input: GetManualRevenuesInput) {
  return findManualRevenues(input)
}

export async function getManualRevenueById(id: string) {
  const item = await findManualRevenueById(id)
  if (!item) throw new Error('MANUAL_REVENUE_NOT_FOUND')
  return item
}

type CreateManualRevenueInput = {
  date: Date
  amount: number
  memo?: string
}

export async function createManualRevenueEntry(input: CreateManualRevenueInput) {
  return createRepo(input)
}

type UpdateManualRevenueInput = {
  date?: Date
  amount?: number
  memo?: string | null
}

export async function updateManualRevenueEntry(id: string, input: UpdateManualRevenueInput) {
  await getManualRevenueById(id)
  return updateRepo(id, input)
}

export async function deleteManualRevenueEntry(id: string) {
  await getManualRevenueById(id)
  return deleteRepo(id)
}
