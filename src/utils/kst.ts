const KST_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const KST_DATETIME_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export function getKstDateString(date: Date): string {
  return KST_FORMATTER.format(date)
}

export function formatKstDateTime(date: Date): string {
  return KST_DATETIME_FORMATTER.format(date)
}

export function isSameKstDate(a: Date, b: Date): boolean {
  return getKstDateString(a) === getKstDateString(b)
}
