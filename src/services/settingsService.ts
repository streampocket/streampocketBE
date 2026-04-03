import {
  getCommissionRate as getRate,
  upsertCommissionRate as upsertRate,
  getAlimtalkUnitCost as getCost,
  upsertAlimtalkUnitCost as upsertCost,
} from '../repositories/settingsRepository'

export async function getCommissionRate(): Promise<number> {
  return getRate()
}

export async function updateCommissionRate(rate: number): Promise<number> {
  return upsertRate(rate)
}

export async function getAlimtalkUnitCost(): Promise<number> {
  return getCost()
}

export async function updateAlimtalkUnitCost(cost: number): Promise<number> {
  return upsertCost(cost)
}
