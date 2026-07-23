import { describe, expect, it } from 'vitest'
import { formatKstDateTime } from './kst'

describe('formatKstDateTime', () => {
  it('UTC 자정을 KST 09:00로 변환한다', () => {
    expect(formatKstDateTime(new Date('2026-07-23T00:00:00Z'))).toBe('2026-07-23 09:00:00')
  })

  it('UTC 15시 이후는 KST 다음 날로 넘어간다', () => {
    expect(formatKstDateTime(new Date('2026-07-23T15:30:45Z'))).toBe('2026-07-24 00:30:45')
  })

  it('YYYY-MM-DD HH:mm:ss 포맷을 유지한다', () => {
    expect(formatKstDateTime(new Date('2026-01-05T03:04:05Z'))).toMatch(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
    )
  })
})
