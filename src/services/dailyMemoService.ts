import { deleteMemoByDate, upsertMemoByDate } from '../repositories/dailyMemoRepository'

// 일일 메모 저장 — 내용을 비워서 저장하면 삭제로 처리 (별도 DELETE 엔드포인트 없음)
export async function saveDailyMemo(
  dateStr: string,
  content: string,
): Promise<{ memo: string | null }> {
  const trimmed = content.trim()
  if (trimmed === '') {
    await deleteMemoByDate(dateStr)
    return { memo: null }
  }
  const saved = await upsertMemoByDate(dateStr, trimmed)
  return { memo: saved.content }
}
