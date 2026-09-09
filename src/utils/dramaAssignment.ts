// 드라마 계정 자동 배정의 "고르는 규칙"만 담은 순수 함수들.
//
// DB 접근과 분리한 이유: 배정 조건(플랫폼·빈자리·마감일)은 경계값이 많아
// 트랜잭션 흉내를 내지 않고 표로 검증할 수 있어야 한다.

import type { OwnProductType } from '@prisma/client'
import type { KstMoment } from './kstDate'

export type CandidateMember = {
  /** @db.Date — UTC 자정 */
  endDate: Date
  /** 'HH:mm' 고정폭 (= 만료 시각) */
  startTime: string
}

/**
 * 고르는 규칙이 실제로 보는 필드만 정의한다.
 * 저장소가 자격증명(passwordEnc 등)을 더 실어 보내도 이 함수들은 신경 쓰지 않도록,
 * 선택 함수들은 이 타입을 **확장한 제네릭**으로 받는다 — 호출측이 원본 행을 그대로 돌려받는다.
 */
export type CandidateAccount = {
  id: string
  email: string
  platform: string | null
  /** 계산용 정원. null = 멤버십 미개설(계정만 등록된 상태) */
  capacity: number | null
  /** 멤버십 마감일. @db.Date — UTC 자정 */
  dueAt: Date | null
  members: CandidateMember[]
}

/**
 * 아직 자리를 차지하고 있는 파티원인가.
 *
 * 기준은 저장소의 `deleteExpiredDramaMembers`, 화면의 `dramaView.decorateAccount`와 반드시 같아야 한다.
 * 어긋나면 화면은 "빈자리 1"이라 표시하는데 배정은 실패하는 상황이 생긴다.
 */
export function isMemberActive(member: CandidateMember, now: KstMoment): boolean {
  const end = member.endDate.getTime()
  const today = now.date.getTime()
  if (end !== today) return end > today
  // 같은 날이면 만료 시각(startTime)이 아직 안 지난 파티원만 자리를 차지한다
  return member.startTime > now.hhmm
}

/** 지금 자리를 차지하고 있는 파티원 수 */
export function countActiveMembers(members: CandidateMember[], now: KstMoment): number {
  return members.filter((m) => isMemberActive(m, now)).length
}

/**
 * 지금 이 계정에 남은 자리 수. 멤버십 미개설(capacity null) 계정은 0.
 * 정원을 넘겨 찬 경우에도 0으로 잘라 보여준다 — 초과 여부 판정에는 countActiveMembers를 쓸 것.
 */
export function countFreeSlots(
  account: Pick<CandidateAccount, 'capacity' | 'members'>,
  now: KstMoment,
): number {
  if (account.capacity == null) return 0
  return Math.max(0, account.capacity - countActiveMembers(account.members, now))
}

export type PickInput = {
  /** 파티명에 대응하는 계정 platform 약칭 목록 (constants/dramaPlatform) */
  platforms: readonly string[]
  /** 이용 만료일(KST 날짜, UTC 자정 Date) — 계정 마감일이 이 날짜 이상이어야 한다 */
  expiryDate: Date
  now: KstMoment
  /** 개인형은 프라이빗(정원 1) 계정에만, 공유형은 2인 이상 계정에만 배정한다 */
  partyType: OwnProductType
}

/**
 * 이 계정이 해당 파티 타입에 맞는가.
 *
 * 프라이빗 판정을 capacityLabel('프라이빗')이 아니라 capacity로 하는 이유:
 * 라벨은 표시용 원문이라 "1인"으로 적은 계정을 놓치고, 파서가 프라이빗을 capacity 1로 이미 정규화한다.
 * capacity가 null(멤버십 미개설)이면 어느 쪽에도 맞지 않는다 — 어차피 빈자리 0으로도 걸러진다.
 */
export function matchesPartyType(capacity: number | null, partyType: OwnProductType): boolean {
  if (capacity == null) return false
  return partyType === 'personal' ? capacity === 1 : capacity >= 2
}

/** 배정 조건을 모두 만족하는 계정인지 */
export function isAssignable(account: CandidateAccount, input: PickInput): boolean {
  const platform = account.platform?.trim()
  if (!platform || !input.platforms.includes(platform)) return false
  if (!matchesPartyType(account.capacity, input.partyType)) return false
  if (account.dueAt == null) return false
  // 마감일 == 만료일은 허용 — 같은 날 끝나는 멤버십으로 그 기간을 채울 수 있다
  if (account.dueAt.getTime() < input.expiryDate.getTime()) return false
  return countFreeSlots(account, input.now) >= 1
}

/**
 * 배정할 계정 1건 선택 — 마감일이 빠른 계정부터 소진한다.
 *
 * 동률이면 email 오름차순. 저장소의 기본 정렬(dueAt asc, email asc)과 같은 순서라
 * 관리자가 화면에서 보는 순서와 배정 순서가 어긋나지 않는다.
 */
export function pickAssignableAccount<T extends CandidateAccount>(
  accounts: T[],
  input: PickInput,
): T | null {
  const eligible = accounts.filter((a) => isAssignable(a, input))
  if (eligible.length === 0) return null

  return eligible.reduce((best, current) => {
    const bestDue = best.dueAt?.getTime() ?? Number.POSITIVE_INFINITY
    const currentDue = current.dueAt?.getTime() ?? Number.POSITIVE_INFINITY
    if (currentDue !== bestDue) return currentDue < bestDue ? current : best
    return current.email < best.email ? current : best
  })
}

export type SecretMatchResult<T> = {
  account: T | null
  /** 같은 시크릿을 쓰는 계정이 둘 이상 — 어느 쪽인지 확정할 수 없다 */
  ambiguous: boolean
}

/**
 * 시크릿으로 계정 역추적 — 자동 배정 없이 관리자가 시크릿만 수동 등록한 건에 쓴다.
 *
 * 호출측이 **복호화한 평문**을 넘겨야 한다. 암호문끼리 비교하면 절대 매칭되지 않는다 —
 * AES-GCM이 매번 랜덤 IV를 써서 같은 평문도 암호문이 달라지기 때문이다(lib/crypto.ts).
 *
 * 비교 전 normalizeSecret과 같은 규칙(공백 제거·대문자)으로 맞춘다. 메모에 4자리씩
 * 띄어 적힌 시크릿과 주문에 붙여넣은 시크릿의 표기가 달라도 같은 계정으로 잡히게 하기 위함이다.
 * 여러 건이면 email 오름차순 첫 건을 돌려주되 ambiguous로 알린다(화면이 경고를 띄운다).
 */
export function matchAccountsBySecret<T extends { email: string; otpSecret: string }>(
  accounts: T[],
  secret: string,
): SecretMatchResult<T> {
  const target = normalizeForCompare(secret)
  if (target === '') return { account: null, ambiguous: false }

  const matched = accounts.filter((a) => normalizeForCompare(a.otpSecret) === target)
  if (matched.length === 0) return { account: null, ambiguous: false }

  const first = matched.reduce((best, current) => (current.email < best.email ? current : best))
  return { account: first, ambiguous: matched.length > 1 }
}

/** lib/totp의 normalizeSecret과 같은 규칙 — 그쪽을 import하면 otpauth까지 딸려와 순수성이 깨진다 */
function normalizeForCompare(secret: string): string {
  return secret.replace(/\s+/g, '').toUpperCase()
}
