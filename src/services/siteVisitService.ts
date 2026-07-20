import {
  createVisitIfAbsent,
  countVisitsByDateRange,
  groupVisitsByDate,
  groupVisitsBySource,
  groupOtherHosts,
} from '../repositories/siteVisitRepository'
import { classifyReferrer } from '../utils/referrerSource'

export const VISIT_SITES = ['gcoin', 'ottall'] as const
export type VisitSite = (typeof VISIT_SITES)[number]

// 봇/크롤러 UA는 집계 제외 (서치콘솔·SNS 미리보기 크롤러 등)
const BOT_UA_PATTERN = /bot|crawler|spider|crawl|headless|preview|scrape/i

const DEFAULT_RANGE_DAYS = 30

// KST 오늘 'YYYY-MM-DD' — +9h 시프트 후 getUTC*로 산출 (서버 타임존 무관)
function kstDateString(offsetDays = 0): string {
  const shifted = new Date(Date.now() + 9 * 3600 * 1000 + offsetDays * 24 * 3600 * 1000)
  const y = shifted.getUTCFullYear()
  const m = String(shifted.getUTCMonth() + 1).padStart(2, '0')
  const d = String(shifted.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 'YYYY-MM-DD' 문자열 하루 증가 — UTC 자정 기준이라 KST 벽시계 문자열 연산에 안전
function nextDateString(date: string): string {
  const next = new Date(`${date}T00:00:00.000Z`)
  next.setUTCDate(next.getUTCDate() + 1)
  return next.toISOString().slice(0, 10)
}

type RecordVisitInput = {
  visitorId: string
  referrer: string | null
  utmSource: string | null
  landingPath: string | null
  userAgent: string | null
}

// 방문 기록 — 봇 제외, 유입 분류 후 (site, visitorId, KST 오늘) 기준 1회만 저장 (멱등)
export async function recordVisit(site: VisitSite, input: RecordVisitInput): Promise<void> {
  if (input.userAgent && BOT_UA_PATTERN.test(input.userAgent)) return

  const { source, referrerHost } = classifyReferrer({
    referrer: input.referrer,
    utmSource: input.utmSource,
  })

  await createVisitIfAbsent({
    site,
    visitorId: input.visitorId,
    visitDate: kstDateString(),
    source,
    referrerHost,
    referrer: input.referrer,
    landingPath: input.landingPath,
  })
}

type VisitStatsInput = {
  from?: string
  to?: string
}

export async function getVisitStats(site: VisitSite, input: VisitStatsInput) {
  const today = kstDateString()
  const to = input.to ?? today
  const from = input.from ?? kstDateString(-(DEFAULT_RANGE_DAYS - 1))

  const [totalVisits, todayVisits, dailyRows, sources, otherHosts] = await Promise.all([
    countVisitsByDateRange(site, from, to),
    countVisitsByDateRange(site, today, today),
    groupVisitsByDate(site, from, to),
    groupVisitsBySource(site, from, to),
    groupOtherHosts(site, from, to),
  ])

  // 방문 없는 날짜도 0으로 채워 연속된 일별 추이 제공 (그래프 공백 방지)
  const countByDate = new Map(dailyRows.map((r) => [r.visitDate, r.count]))
  const daily: { date: string; count: number }[] = []
  for (let date = from; date <= to; date = nextDateString(date)) {
    daily.push({ date, count: countByDate.get(date) ?? 0 })
  }

  return {
    site,
    range: { from, to },
    totalVisits,
    todayVisits,
    daily,
    sources,
    otherHosts,
  }
}
