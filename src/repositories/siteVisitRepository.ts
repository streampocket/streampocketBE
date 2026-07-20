import { prisma } from '../lib/prisma'

type CreateVisitInput = {
  site: string
  visitorId: string
  visitDate: string
  source: string
  referrerHost: string | null
  referrer: string | null
  landingPath: string | null
}

// 하루 1회 백스톱 — (site, visitorId, visitDate) unique 충돌은 조용히 무시 (멱등)
export async function createVisitIfAbsent(data: CreateVisitInput): Promise<void> {
  await prisma.siteVisit.createMany({ data: [data], skipDuplicates: true })
}

export async function countVisitsByDateRange(
  site: string,
  from: string,
  to: string,
): Promise<number> {
  return prisma.siteVisit.count({
    where: { site, visitDate: { gte: from, lte: to } },
  })
}

export async function groupVisitsByDate(
  site: string,
  from: string,
  to: string,
): Promise<{ visitDate: string; count: number }[]> {
  const rows = await prisma.siteVisit.groupBy({
    by: ['visitDate'],
    where: { site, visitDate: { gte: from, lte: to } },
    _count: { _all: true },
    orderBy: { visitDate: 'asc' },
  })
  return rows.map((r) => ({ visitDate: r.visitDate, count: r._count._all }))
}

export async function groupVisitsBySource(
  site: string,
  from: string,
  to: string,
): Promise<{ source: string; count: number }[]> {
  const rows = await prisma.siteVisit.groupBy({
    by: ['source'],
    where: { site, visitDate: { gte: from, lte: to } },
    _count: { _all: true },
    orderBy: { _count: { source: 'desc' } },
  })
  return rows.map((r) => ({ source: r.source, count: r._count._all }))
}

// '기타' 유입의 host별 상세 (상위 20개)
export async function groupOtherHosts(
  site: string,
  from: string,
  to: string,
): Promise<{ host: string; count: number }[]> {
  const rows = await prisma.siteVisit.groupBy({
    by: ['referrerHost'],
    where: { site, source: 'other', visitDate: { gte: from, lte: to } },
    _count: { _all: true },
    orderBy: { _count: { referrerHost: 'desc' } },
    take: 20,
  })
  return rows
    .filter((r) => r.referrerHost !== null)
    .map((r) => ({ host: r.referrerHost ?? '', count: r._count._all }))
}
