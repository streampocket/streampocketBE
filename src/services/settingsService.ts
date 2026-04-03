import {
  getAlimtalkUnitCost as getCost,
  upsertAlimtalkUnitCost as upsertCost,
} from '../repositories/settingsRepository'

export async function getAlimtalkUnitCost(): Promise<number> {
  return getCost()
}

export async function updateAlimtalkUnitCost(cost: number): Promise<number> {
  return upsertCost(cost)
}
