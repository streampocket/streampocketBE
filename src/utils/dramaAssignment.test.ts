import { describe, expect, it } from 'vitest'
import {
  countFreeSlots,
  isAssignable,
  isMemberActive,
  matchAccountsBySecret,
  matchesPartyType,
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
  // 기본 픽스처는 정원 3(공유형 계정)이라 partyType도 shared로 맞춘다
  const input = {
    platforms: ['비글'],
    expiryDate: toDateOnly('2026-09-11'),
    now: NOW,
    partyType: 'shared' as const,
  }

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

describe('공유형/개인형 구분', () => {
  const base = { platforms: ['비글'], expiryDate: toDateOnly('2026-09-11'), now: NOW }
  const personal = { ...base, partyType: 'personal' as const }
  const shared = { ...base, partyType: 'shared' as const }

  it('개인형은 프라이빗(정원 1) 계정에 배정된다', () => {
    expect(isAssignable(account({ capacity: 1 }), personal)).toBe(true)
  })

  // 개인형은 "로그아웃 10% · 모바일 2대"로 파는 별도 상품이라 공유 계정에 넣으면 안 된다
  it('개인형은 2인 이상 공유 계정에 배정되지 않는다', () => {
    expect(isAssignable(account({ capacity: 3 }), personal)).toBe(false)
  })

  it('공유형은 2인 이상 계정에 배정된다', () => {
    expect(isAssignable(account({ capacity: 3 }), shared)).toBe(true)
  })

  // 프라이빗 재고는 개인형 판매용으로 남겨둔다
  it('공유형은 프라이빗 계정을 쓰지 않는다', () => {
    expect(isAssignable(account({ capacity: 1 }), shared)).toBe(false)
  })

  it('멤버십 미개설(capacity null)은 양쪽 모두 배정 불가', () => {
    expect(isAssignable(account({ capacity: null }), personal)).toBe(false)
    expect(isAssignable(account({ capacity: null }), shared)).toBe(false)
  })

  it('matchesPartyType 단독 판정', () => {
    expect(matchesPartyType(1, 'personal')).toBe(true)
    expect(matchesPartyType(2, 'personal')).toBe(false)
    expect(matchesPartyType(2, 'shared')).toBe(true)
    expect(matchesPartyType(1, 'shared')).toBe(false)
    expect(matchesPartyType(null, 'shared')).toBe(false)
  })

  it('타입이 맞아도 빈자리가 없으면 배정 불가', () => {
    const fullPrivate = account({ capacity: 1, members: [member('2026-09-30')] })
    expect(isAssignable(fullPrivate, personal)).toBe(false)
  })
})

describe('계정 선택 — 마감일 빠른 순', () => {
  // 기본 픽스처는 정원 3(공유형 계정)이라 partyType도 shared로 맞춘다
  const input = {
    platforms: ['비글'],
    expiryDate: toDateOnly('2026-09-11'),
    now: NOW,
    partyType: 'shared' as const,
  }

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

describe('시크릿으로 계정 역추적', () => {
  const accounts = [
    { email: 'b@x.com', otpSecret: 'JBSWY3DPEHPK3PXP' },
    { email: 'a@x.com', otpSecret: 'KRSXG5DJNZTQ7777' },
    { email: 'c@x.com', otpSecret: 'MFRGGZDFMZTWQ2LK' },
  ]

  it('일치하는 계정 1건을 찾는다', () => {
    const result = matchAccountsBySecret(accounts, 'KRSXG5DJNZTQ7777')
    expect(result.account?.email).toBe('a@x.com')
    expect(result.ambiguous).toBe(false)
  })

  it('일치하는 계정이 없으면 null', () => {
    const result = matchAccountsBySecret(accounts, 'NBSWY3DPEB3W64TMMQ')
    expect(result.account).toBeNull()
    expect(result.ambiguous).toBe(false)
  })

  it('후보가 비어 있으면 null', () => {
    expect(matchAccountsBySecret([], 'KRSXG5DJNZTQ7777').account).toBeNull()
  })

  // 메모에는 4자리씩 띄어 적고 주문에는 붙여 넣는 식으로 표기가 갈릴 수 있다
  it('공백과 대소문자를 무시하고 비교한다', () => {
    const result = matchAccountsBySecret(accounts, ' krsx g5dj nztq 7777 ')
    expect(result.account?.email).toBe('a@x.com')
  })

  it('계정 쪽 표기에 공백이 있어도 찾는다', () => {
    const spaced = [{ email: 'a@x.com', otpSecret: 'KRSX G5DJ NZTQ 7777' }]
    expect(matchAccountsBySecret(spaced, 'KRSXG5DJNZTQ7777').account?.email).toBe('a@x.com')
  })

  // 같은 시크릿을 여러 계정에 쓴 경우 — 잘못된 계정을 조용히 보여주면 안 되므로 알린다
  it('같은 시크릿 계정이 여럿이면 email 오름차순 첫 건 + ambiguous', () => {
    const dupes = [
      { email: 'z@x.com', otpSecret: 'KRSXG5DJNZTQ7777' },
      { email: 'a@x.com', otpSecret: 'KRSXG5DJNZTQ7777' },
    ]
    const result = matchAccountsBySecret(dupes, 'KRSXG5DJNZTQ7777')
    expect(result.account?.email).toBe('a@x.com')
    expect(result.ambiguous).toBe(true)
  })

  it('빈 시크릿은 아무것도 매칭하지 않는다', () => {
    const blanks = [{ email: 'a@x.com', otpSecret: '' }]
    expect(matchAccountsBySecret(blanks, '   ').account).toBeNull()
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
