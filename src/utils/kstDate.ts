// KST(Asia/Seoul) 날짜 변환 공통 헬퍼.
//
// 드라마 계정의 dueAt·endDate는 @db.Date라 UTC 자정으로 저장된다.
// 이 값을 Date 객체로 다룰 때 로컬 타임존을 타면 날짜가 하루 밀리므로,
// 문자열 왕복(ISO slice)으로만 변환한다 — 서버 타임존 설정과 무관하게 같은 결과가 나온다.

/** @db.Date 컬럼은 UTC 자정으로 저장되므로 UTC 기준으로 읽어야 날짜가 밀리지 않는다 */
export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** 'YYYY-MM-DD' → UTC 자정 Date. @db.Date에 그대로 저장된다 */
export function toDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`)
}

/** 어떤 시각을 KST로 봤을 때의 날짜(UTC 자정 Date)와 'HH:mm' */
export type KstMoment = { date: Date; hhmm: string }

/**
 * 임의의 시각을 KST 기준 날짜·시각으로 나눈다.
 *
 * `hhmm`은 `DramaMember.startTime`과 같은 'HH:mm' 5자리 고정폭이라
 * 문자열 비교가 곧 시간 비교다 (파티원 정렬·만료 판정이 이 성질에 기대고 있다).
 */
export function kstMomentOf(date: Date): KstMoment {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString()
  return { date: toDateOnly(kst.slice(0, 10)), hhmm: kst.slice(11, 16) }
}

/** KST 기준 'MM-DD' — 알림톡 만료 안내 문구용 */
export function kstMonthDay(date: Date): string {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(5, 10)
}
