import { describe, expect, it } from 'vitest'
import {
  countFreeSlots,
  isAssignable,
  isMemberActive,
  pickAssignableAccount,
  type CandidateAccount,
} from './dramaAssignment'
import { toDateOnly } from './kstDate'
import { PARTY_TO_DRAMA_PLATFORM, resolveDramaPlatforms } from '../constants/dramaPlatform'

/** KST 2026-09-04 12:00 시점 */
const NOW = { date: toDateOnly('2026-09-04'), hhmm: '12:00' }

const member = (endDate: string, startTime = '01:30') => ({ endDate: toDateOnly(endDate), startTime })

const account = (over: Partial<CandidateAccount> = {}): CandidateAccount => ({
  id: 'acc-1',
  email: 'a@example.com',
  platform: '비글',
  capacity: 3,
  dueAt: toDateOnly('2026-09-20'),
  members: [],
  ...over,
})

describe('파티원 활성 판정 (자리를 차지하고 있는가)', () => {
  it('만료일이 내일 이후면 자리를 차지한다', () => {
    expect(isMemberActive(member('2026-09-05'), NOW)).toBe(true)
  })

  it('만료일이 어제 이전이면 자리가 비어 있다', () => {
    expect(isMemberActive(member('2026-09-03'), NOW)).toBe(false)
  })

  // 날짜만 보면 오늘 01:30에 끝난 자리가 하루 종일 차 있는 것으로 남는다
  it('오늘 만료인데 만료 시각이 이미 지났으면 자리가 비어 있다', () => {
    expect(isMemberActive(member('2026-09-04', '01:30'), NOW)).toBe(false)
  })

  it('오늘 만료인데 만료 시각이 아직 안 지났으면 자리를 차지한다', () => {
    expect(isMemberActive(member('2026-09-04', '23:30'), NOW)).toBe(true)
  })
})

describe('빈자리 계산', () => {
  it('정원에서 활성 파티원만 뺀다 — 만료된 파티원은 자리를 비운 것으로 센다', () => {
    const acc = account({
      capacity: 3,
      members: [member('2026-09-10'), member('2026-09-01'), member('2026-09-04', '01:30')],
    })
    expect(countFreeSlots(acc, NOW)).toBe(2)
  })

  it('정원이 꽉 차면 0', () => {
    const acc = account({ capacity: 2, members: [member('2026-09-10'), member('2026-09-11')] })
    expect(countFreeSlots(acc, NOW)).toBe(0)
  })

  // capacity null = "계정만 등록된 상태"(멤버십 미개설) — 줄 자리가 없다
  it('멤버십 미개설(capacity null) 계정은 빈자리 0', () => {
    expect(countFreeSlots(account({ capacity: null }), NOW)).toBe(0)
  })
})

describe('배정 가능 조건', () => {
  const input = { platforms: ['비글'], expiryDate: toDateOnly('2026-09-11'), now: NOW }

  it('플랫폼·마감일·빈자리를 모두 만족하면 배정 가능', () => {
    expect(isAssignable(account(), input)).toBe(true)
  })

  it('플랫폼이 다르면 배정 불가', () => {
    expect(isAssignable(account({ platform: '드박' }), input)).toBe(false)
  })

  it('플랫폼이 비어 있으면(멤버십 미개설) 배정 불가', () => {
    expect(isAssignable(account({ platform: null }), input)).toBe(false)
  })

  it('platform 앞뒤 공백은 무시하고 비교한다', () => {
    expect(isAssignable(account({ platform: ' 비글 ' }), input)).toBe(true)
  })

  // 경계값 — 9/11에 끝나는 이용을 마감일 9/11 계정으로 채울 수 있다
  it('마감일 == 만료일이면 배정 가능', () => {
    expect(isAssignable(account({ dueAt: toDateOnly('2026-09-11') }), input)).toBe(true)
  })

  it('마감일이 만료일보다 하루라도 이르면 배정 불가', () => {
    expect(isAssignable(account({ dueAt: toDateOnly('2026-09-10') }), input)).toBe(false)
  })

  it('마감일이 없으면 배정 불가', () => {
    expect(isAssignable(account({ dueAt: null }), input)).toBe(false)
  })

  it('빈자리가 없으면 배정 불가', () => {
    const full = account({ capacity: 1, members: [member('2026-09-30')] })
    expect(isAssignable(full, input)).toBe(false)
  })
})

describe('계정 선택 — 마감일 빠른 순', () => {
  const input = { platforms: ['비글'], expiryDate: toDateOnly('2026-09-11'), now: NOW }

  it('조건을 만족하는 계정 중 마감일이 가장 빠른 것을 고른다', () => {
    const picked = pickAssignableAccount(
      [
        account({ id: 'late', email: 'b@x.com', dueAt: toDateOnly('2026-09-20') }),
        account({ id: 'early', email: 'c@x.com', dueAt: toDateOnly('2026-09-14') }),
        account({ id: 'latest', email: 'a@x.com', dueAt: toDateOnly('2026-09-25') }),
      ],
      input,
    )
    expect(picked?.id).toBe('early')
  })

  it('마감일이 같으면 email 오름차순으로 고른다', () => {
    const picked = pickAssignableAccount(
      [
        account({ id: 'second', email: 'b@x.com', dueAt: toDateOnly('2026-09-14') }),
        account({ id: 'first', email: 'a@x.com', dueAt: toDateOnly('2026-09-14') }),
      ],
      input,
    )
    expect(picked?.id).toBe('first')
  })

  it('마감일이 더 빨라도 빈자리가 없으면 건너뛴다', () => {
    const picked = pickAssignableAccount(
      [
        account({ id: 'full', dueAt: toDateOnly('2026-09-12'), capacity: 1, members: [member('2026-09-30')] }),
        account({ id: 'open', dueAt: toDateOnly('2026-09-18') }),
      ],
      input,
    )
    expect(picked?.id).toBe('open')
  })

  it('조건을 만족하는 계정이 하나도 없으면 null', () => {
    expect(pickAssignableAccount([account({ platform: '드박' })], input)).toBeNull()
  })

  it('후보가 비어 있으면 null', () => {
    expect(pickAssignableAccount([], input)).toBeNull()
  })
})

describe('파티명 → 플랫폼 매핑', () => {
  it('파티명이 계정 약칭과 다른 경우를 이어준다', () => {
    expect(resolveDramaPlatforms('비글루')).toEqual(['비글'])
    expect(resolveDramaPlatforms('드라마 웨이브')).toEqual(['드웨'])
  })

  it('앞뒤 공백이 있어도 찾는다', () => {
    expect(resolveDramaPlatforms('  비글루  ')).toEqual(['비글'])
  })

  it('매핑에 없는 파티명은 빈 배열 — 자동 배정 대상이 아니다', () => {
    expect(resolveDramaPlatforms('없는파티')).toEqual([])
  })

  // 파티명은 fe/constants/ottImages.ts의 라벨에서 온다. 백엔드가 그 파일을 읽을 수 없으므로
  // 키 목록을 여기에 못 박아, 새 OTT를 추가할 때 매핑 갱신을 반드시 거치게 만든다
  // (매핑을 빠뜨리면 에러 없이 자동배정만 조용히 안 되기 때문).
  it('파티 종류 7종의 매핑이 모두 정의돼 있다', () => {
    expect(Object.keys(PARTY_TO_DRAMA_PLATFORM).sort()).toEqual(
      ['드라마 박스', '드라마 웨이브', '릴숏', '넷숏', '비글루', '숏맥스', '플릭릴스'].sort(),
    )
  })
})
