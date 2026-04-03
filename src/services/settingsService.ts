import {
  getCommissionRate as getRate,
  upsertCommissionRate as upsertRate,
  findMonthlyAdjustment,
  upsertMonthlyAdjustment as upsertAdj,
} from '../repositories/settingsRepository'

export async function getCommissionRate(): Promise<number> {
  return getRate()
}

export async function updateCommissionRate(rate: number): Promise<number> {
  return upsertRate(rate)
}

type AdjustmentResult = {
  yearMonth: string
  paymentAdjustment: number
  commissionAdjustment: number
  netRevenueAdjustment: number
  memo: string | null
}

export async function getMonthlyAdjustment(yearMonth: string): Promise<AdjustmentResult> {
  const adj = await findMonthlyAdjustment(yearMonth)
  return adj ?? {
    yearMonth,
    paymentAdjustment: 0,
    commissionAdjustment: 0,
    netRevenueAdjustment: 0,
    memo: null,
  }
}

export async function updateMonthlyAdjustment(
  yearMonth: string,
  data: {
    paymentAdjustment: number
    commissionAdjustment: number
    netRevenueAdjustment: number
    memo?: string
  },
) {
  return upsertAdj(yearMonth, data)
}
