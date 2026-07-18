import { Request, Response } from 'express'
import { z } from 'zod'
import { buildDailyReport } from '../services/dailySalesReportService'
import { saveDailyMemo } from '../services/dailyMemoService'
import {
  getDashboardStats,
  getRevenueCalendar,
  getProductRanking,
  getAverageDecisionDays,
} from '../services/steamDashboardService'

const periodSchema = z.enum(['today', 'week', 'month', 'all']).default('today')
// store 미지정 = 전체(공통 포함). 지정 시 해당 store만(공통 제외).
const storeSchema = z.enum(['streampocket', 'pokemon_steam']).optional()

export async function getDashboardStatsHandler(req: Request, res: Response): Promise<void> {
  const period = periodSchema.parse(req.query.period)
  const store = storeSchema.parse(req.query.store)
  const stats = await getDashboardStats(period, store)
  res.json({ data: stats })
}

const yearMonthSchema = z
  .string('yearMonth는 필수입니다.')
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'yearMonth는 YYYY-MM 형식이어야 합니다.')

export async function getRevenueCalendarHandler(req: Request, res: Response): Promise<void> {
  const yearMonth = yearMonthSchema.parse(req.query.yearMonth)
  const store = storeSchema.parse(req.query.store)
  const calendar = await getRevenueCalendar(yearMonth, store)
  res.json({ data: calendar })
}

const dateSchema = z
  .string('date는 필수입니다.')
  .regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, 'date는 YYYY-MM-DD 형식이어야 합니다.')

// 일일 종합 리포트 조회 — 디스코드 23:59 발송분과 같은 빌더를 사용 (항상 전사 기준)
export async function getDailyReportHandler(req: Request, res: Response): Promise<void> {
  const date = dateSchema.parse(req.query.date)
  const report = await buildDailyReport(date)
  res.json({ data: report })
}

const memoBodySchema = z.object({
  date: dateSchema,
  content: z.string().max(1000, '메모는 1000자 이하로 입력해주세요.'),
})

export async function saveDailyMemoHandler(req: Request, res: Response): Promise<void> {
  const body = memoBodySchema.parse(req.body)
  const result = await saveDailyMemo(body.date, body.content)
  res.json({ data: result })
}

export async function getDashboardExtrasHandler(req: Request, res: Response): Promise<void> {
  const store = storeSchema.parse(req.query.store)
  const [productRanking, averageDecisionDays] = await Promise.all([
    getProductRanking(store),
    getAverageDecisionDays(store),
  ])
  res.json({ data: { productRanking, averageDecisionDays } })
}
