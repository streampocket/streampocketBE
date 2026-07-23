// sv-SE 로케일은 'YYYY-MM-DD HH:mm:ss' 형태(ISO 유사)를 반환한다
const KST_DATETIME_FORMAT = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

// KST 기준 'YYYY-MM-DD HH:mm:ss' 문자열 반환
export function formatKstDateTime(date: Date = new Date()): string {
  return KST_DATETIME_FORMAT.format(date)
}
