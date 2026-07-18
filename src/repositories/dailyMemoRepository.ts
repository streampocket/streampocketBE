import { prisma } from '../lib/prisma'

// date는 'YYYY-MM-DD' 문자열을 @db.Date 컬럼에 맞춰 UTC 자정 Date로 변환해 사용
// (Prisma @db.Date는 시간 부분을 버리므로 KST 오프셋을 붙이면 전날로 밀린다)
function toDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`)
}

export async function upsertMemoByDate(dateStr: string, content: string) {
  const date = toDateOnly(dateStr)
  return prisma.dailyMemo.upsert({
    where: { date },
    create: { date, content },
    update: { content },
  })
}

export async function findMemoByDate(dateStr: string) {
  return prisma.dailyMemo.findUnique({ where: { date: toDateOnly(dateStr) } })
}

// 캘린더 셀 📝 표시용 — 기간 내 메모가 존재하는 날짜 목록만 반환
export async function findMemoDatesInRange(startStr: string, endStr: string): Promise<string[]> {
  const rows = await prisma.dailyMemo.findMany({
    where: { date: { gte: toDateOnly(startStr), lte: toDateOnly(endStr) } },
    select: { date: true },
  })
  return rows.map((r) => r.date.toISOString().slice(0, 10))
}

export async function deleteMemoByDate(dateStr: string): Promise<void> {
  await prisma.dailyMemo.deleteMany({ where: { date: toDateOnly(dateStr) } })
}
