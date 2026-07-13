import { z } from 'zod'
import { findUsdKrwRate, upsertUsdKrwRate } from '../../repositories/gcoin/exchangeRateRepository'

const ER_API_URL = 'https://open.er-api.com/v6/latest/USD'

const erApiResponseSchema = z.object({
  result: z.string(),
  rates: z.object({ KRW: z.number().finite().positive() }),
})

/**
 * open.er-api.com에서 USD→KRW 환율을 가져와 저장한다.
 * 실패 시 throw — 호출부(크론)에서 catch하고 DB의 마지막 저장값을 계속 사용한다.
 */
export async function refreshUsdKrwRate() {
  const res = await fetch(ER_API_URL)
  if (!res.ok) {
    throw new Error(`환율 API 응답 오류: ${res.status}`)
  }

  const parsed = erApiResponseSchema.safeParse(await res.json())
  if (!parsed.success || parsed.data.result !== 'success') {
    throw new Error(`환율 API 응답 형식 오류: ${parsed.success ? parsed.data.result : parsed.error.message}`)
  }

  const saved = await upsertUsdKrwRate(parsed.data.rates.KRW, new Date())
  return { rate: Number(saved.rate), fetchedAt: saved.fetchedAt }
}

/** 저장된 USD→KRW 환율. 아직 한 번도 성공한 적 없으면 null */
export async function getUsdKrwRate(): Promise<number | null> {
  const row = await findUsdKrwRate()
  return row ? Number(row.rate) : null
}

/** 관리자 폼 미리보기용 — 환율과 fetch 시각 */
export async function getUsdKrwRateInfo(): Promise<{ rate: number; fetchedAt: Date } | null> {
  const row = await findUsdKrwRate()
  return row ? { rate: Number(row.rate), fetchedAt: row.fetchedAt } : null
}

/** 달러 정가 → 원화 환산 (100원 단위 반올림) */
export function toKrwListPrice(usd: number, rate: number): number {
  return Math.round((usd * rate) / 100) * 100
}
