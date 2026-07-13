import type { Request, Response } from 'express'
import {
  getUsdKrwRateInfo,
  refreshUsdKrwRate,
} from '../../services/gcoin/exchangeRateService'

/** 현재 저장된 USD→KRW 환율 조회 (관리자 폼 환산 미리보기용) */
export async function getExchangeRateHandler(_req: Request, res: Response): Promise<void> {
  const info = await getUsdKrwRateInfo()
  res.json({ data: info })
}

/** 환율 즉시 갱신 (초기 세팅·장애 복구용 수동 트리거) */
export async function refreshExchangeRateHandler(_req: Request, res: Response): Promise<void> {
  const info = await refreshUsdKrwRate()
  res.json({ data: info })
}
