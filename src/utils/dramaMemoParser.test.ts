import { describe, expect, it } from 'vitest'
import { formatHeadLine, formatMemberLine, parseDramaMemo, splitSiteAndName } from './dramaMemoParser'

// 아래 케이스는 전부 사용자의 실제 메모 171건에서 나온 것이다.
// 초안 파서가 이 7가지에서 깨졌고, 특히 "프라이빗"은 90여 건을 계정만 등록된 상태로 오인시키면서
// OTP 시크릿까지 밀어냈다. 형식이 또 늘어나면 여기부터 케이스를 추가한다.

const one = (memo: string) => parseDramaMemo(memo)[0]

describe('표준 형태', () => {
  const memo = `[2026-08-29]-릴숏 3인
virginiahickma3123846@gmail.com
JcR1322TJe
c6dlaebtb34qnw5q3n3j13123mg
(스트림포켓 경원 - 2026.08.05/01:30 7일)
(스트림포켓 지은 - 2026.08.05/02:30 7일)
(스트림포켓 수민맘 - 2026.08.05/08:30 7일)`

  it('헤더·자격증명·파티원을 모두 읽는다', () => {
    const acc = one(memo)
    expect(acc.dueAt).toBe('2026-08-29')
    expect(acc.platform).toBe('릴숏')
    expect(acc.capacity).toBe(3)
    expect(acc.capacityLabel).toBe('3인')
    expect(acc.email).toBe('virginiahickma3123846@gmail.com')
    expect(acc.password).toBe('JcR1322TJe')
    expect(acc.otpSecret).toBe('c6dlaebtb34qnw5q3n3j13123mg')
    expect(acc.members).toHaveLength(3)
    expect(acc.errors).toEqual([])
  })

  it('파티원 항목이 필드로 분해된다', () => {
    const [first] = one(memo).members
    expect(first).toEqual({
      site: '스트림포켓',
      name: '경원',
      siteSpaced: true,
      endDate: '2026-08-05',
      startTime: '01:30',
      days: 7,
      suffix: null,
    })
  })

  it('빈 줄로 나뉜 계정을 각각 읽는다', () => {
    const accounts = parseDramaMemo(`${memo}\n\n${memo.replace('virginiahickma3123846', 'second')}`)
    expect(accounts).toHaveLength(2)
    expect(accounts[1].index).toBe(2)
  })
})

describe('실패 케이스 1 — 프라이빗 정원', () => {
  // 가장 파급이 컸던 건. "N인"만 정원으로 인정해서 헤더가 비밀번호 자리로 밀리고
  // 진짜 비밀번호가 OTP 자리로, OTP는 통째로 버려졌다.
  const acc = one(`[2026-08-06]-비글 프라이빗
virginiadoctors783@gmail.com
z7XK8gQm2Wd
rrmohpdk5s7f6g6x4eyqfjk3fzk3yvpe`)

  it('정원 1로 계산하되 표기는 "프라이빗" 원문을 유지한다', () => {
    expect(acc.platform).toBe('비글')
    expect(acc.capacity).toBe(1)
    expect(acc.capacityLabel).toBe('프라이빗')
  })

  it('자격증명이 밀리지 않는다', () => {
    expect(acc.email).toBe('virginiadoctors783@gmail.com')
    expect(acc.password).toBe('z7XK8gQm2Wd')
    expect(acc.otpSecret).toBe('rrmohpdk5s7f6g6x4eyqfjk3fzk3yvpe')
    expect(acc.errors).toEqual([])
    expect(acc.notes).toEqual([])
  })
})

describe('실패 케이스 2 — 카카오톡 닉네임', () => {
  it('알려진 사이트가 아니면 앞부분 전체가 이름이다', () => {
    // 예전에는 "상담하는"을 사이트로 잘라내 이름이 "죠르디"가 됐다
    const [m] = one(`[2026-08-07]-비글 3인
a@b.com
pw
otpsecretotpsecret1234
(상담하는 죠르디 - 2026.08.05/01:30 7일)`).members
    expect(m.site).toBeNull()
    expect(m.name).toBe('상담하는 죠르디')
  })

  it.each([
    ['생각이 많은 스카피', null, '생각이 많은 스카피', false],
    ['팝콘 먹는 춘식이', null, '팝콘 먹는 춘식이', false],
    ['스트림포켓 김가은', '스트림포켓', '김가은', true],
    ['중고나라 멍든망고', '중고나라', '멍든망고', true],
    ['중고나라#7561308', '중고나라', '#7561308', false],
  ])('splitSiteAndName(%s)', (raw, site, name, siteSpaced) => {
    expect(splitSiteAndName(raw)).toEqual({ site, name, siteSpaced })
  })
})

describe('실패 케이스 3 — 이름이 한 단어', () => {
  it.each(['현명', '야망', '나이', '비글루'])('사이트 없이 "%s" 하나만 있어도 읽는다', (name) => {
    const [m] = one(`[2026-08-01]-비글 3인
a@b.com
pw
otpsecretotpsecret1234
(${name} - 2026.08.01/19:00 14일)`).members
    expect(m).toMatchObject({ site: null, name, days: 14 })
  })
})

describe('실패 케이스 4 — 사이트와 번호가 붙어 있음', () => {
  const line = '(중고나라#7561308 - 2026.08.05/01:30 7일)'
  const [m] = one(`[2026-08-07]-비글 3인\na@b.com\npw\notpsecretotpsecret1234\n${line}`).members

  it('접두 일치로 사이트를 떼어낸다', () => {
    expect(m.site).toBe('중고나라')
    expect(m.name).toBe('#7561308')
  })

  it('되돌릴 때 공백을 끼워 넣지 않는다', () => {
    // 사이트+이름을 무조건 공백으로 잇던 초안은 "중고나라 #7561308"이 되어 원문과 달라졌다
    expect(m.siteSpaced).toBe(false)
    expect(formatMemberLine(m)).toBe(line)
  })
})

describe('실패 케이스 5 — 괄호 뒤 기기 메모', () => {
  it.each([
    ['(스트림포켓 이슬 - 2026.08.25/17:30 30일)-갤s26', '-갤s26'],
    ['(스트림포켓 박시아 - 2026.08.03/11:30 7일) 갤Z폴드7', ' 갤Z폴드7'],
    ['(스트림포켓 다현 - 2026.08.03/12:30 7일) 아이폰', ' 아이폰'],
  ])('%s → 꼬리를 원문 그대로 보존한다', (line, suffix) => {
    const [m] = one(`[2026-08-25]-릴숏 3인\na@b.com\npw\notpsecretotpsecret1234\n${line}`).members
    expect(m.suffix).toBe(suffix)
    expect(formatMemberLine(m)).toBe(line)
  })
})

describe('실패 케이스 6 — 닫는 괄호 중복(오타)', () => {
  it('여분 괄호를 흡수하고 원문도 그대로 되돌린다', () => {
    const line = '(스트림포켓 채수림 - 2026.08.05/10:30 7일))'
    const [m] = one(`[2026-08-05]-드웨 프라이빗\na@b.com\npw\notpsecretotpsecret1234\n${line}`).members
    expect(m.name).toBe('채수림')
    expect(formatMemberLine(m)).toBe(line)
  })
})

describe('실패 케이스 7 — 파티원이 아닌 괄호 줄', () => {
  it('"(로그아웃완료)"는 메모로 보존하고 자격증명을 밀지 않는다', () => {
    const acc = one(`[2026-07-23]-비글 3인
lapurivum89@gmail.com
A4mfipcz124
u6bkvcqm8xn3kr7bs2vh9fpc
(로그아웃완료)`)
    expect(acc.notes).toEqual(['(로그아웃완료)'])
    expect(acc.otpSecret).toBe('u6bkvcqm8xn3kr7bs2vh9fpc')
    expect(acc.members).toEqual([])
    expect(acc.errors).toEqual([])
  })
})

describe('계정만 등록된 상태', () => {
  it('헤더가 없으면 멤버십 관련 값이 모두 null이다', () => {
    const acc = one(`zomiwama64@gmail.com
WXgDyM234
2pyusgqm8xn3kr7bs2vh9fpc`)
    expect(acc.platform).toBeNull()
    expect(acc.capacity).toBeNull()
    expect(acc.dueAt).toBeNull()
    expect(acc.errors).toEqual([])
  })
})

describe('경고 (등록은 되지만 확인이 필요한 것)', () => {
  it('정원을 넘긴 파티원 수는 경고로만 알린다', () => {
    const acc = one(`[2026-08-02]-드박 3인
eyuquxo119@gmail.com
6vuLLpKWg234
ncwqreqm8xn3kr7bs2vh9fpc
(볼 찌르는 라이언 - 2026.07.29/09:00 3일)
(스트림포켓 김진선 - 2026.08.02/10:00 7일)
(스트림포켓 주연 - 2026.07.29/11:00 3일)
(스트림포켓 장한성 - 2026.07.30/12:00 3일)`)
    expect(acc.errors).toEqual([])
    expect(acc.warnings.some((w) => w.includes('정원'))).toBe(true)
  })

  it('사이트를 못 찾은 파티원이 있으면 경고한다', () => {
    const acc = one(`[2026-08-02]-드웨 2인
a@b.com
pw
otpsecretotpsecret1234
(예민한 팬더주니어 - 2026.08.02/09:00 7일)`)
    expect(acc.warnings.some((w) => w.includes('사이트'))).toBe(true)
  })

  it('OTP 시크릿이 지나치게 짧으면 경고한다', () => {
    const acc = one(`a@b.com
pw
short`)
    expect(acc.warnings.some((w) => w.includes('OTP'))).toBe(true)
  })
})

describe('오류 (등록 불가)', () => {
  it('이메일이 없으면 오류', () => {
    expect(one('pw\notpsecretotpsecret1234').errors).toContain('이메일(계정 아이디)을 찾지 못했습니다')
  })

  it('비밀번호·OTP가 없으면 오류', () => {
    const acc = one('a@b.com')
    expect(acc.errors).toContain('비밀번호 줄이 없습니다')
    expect(acc.errors).toContain('OTP 시크릿 줄이 없습니다')
  })
})

describe('원문 재현', () => {
  it('헤더를 원문 그대로 되돌린다', () => {
    expect(formatHeadLine({ dueAt: '2026-08-29', platform: '릴숏', capacityLabel: '3인' })).toBe(
      '[2026-08-29]-릴숏 3인',
    )
    expect(formatHeadLine({ dueAt: '2026-08-06', platform: '비글', capacityLabel: '프라이빗' })).toBe(
      '[2026-08-06]-비글 프라이빗',
    )
  })

  it('한 자리 시각도 두 자리로 채워 형식을 맞춘다', () => {
    const [m] = one(`a@b.com\npw\notpsecretotpsecret1234\n(스트림포켓 가 - 2026.08.05/9:30 7일)`).members
    expect(m.startTime).toBe('09:30')
  })
})
