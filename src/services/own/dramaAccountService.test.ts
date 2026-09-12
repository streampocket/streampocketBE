import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// 저장소는 모킹한다 — 여기서 고정하려는 건 DB 동작이 아니라
// "언제 막고 언제 저장하는가"라는 판단 규칙이다.
const repo = vi.hoisted(() => ({
  findDramaAccountById: vi.fn(),
  findDramaAccountsByEmails: vi.fn(),
  findAllDramaAccounts: vi.fn(),
  createDramaAccount: vi.fn(),
  replaceDramaAccount: vi.fn(),
  deleteExpiredDramaMembers: vi.fn(),
}))

vi.mock('../../repositories/own/dramaAccountRepository', () => ({
  ...repo,
  createDramaAccountsBulk: vi.fn(),
  deleteDramaAccountById: vi.fn(),
  deleteDramaMember: vi.fn(),
}))

// 암호화는 실제 구현을 쓴다 (키만 테스트용으로 준다).
// 저장 경로가 응답을 만들며 복호화하므로 모킹 반환값도 진짜 암호문이어야 한다.
process.env['OTP_SECRET_ENC_KEY'] = 'a'.repeat(64)

const { encryptSecret } = await import('../../lib/crypto')
const {
  listDramaAccounts,
  loadAccountMemo,
  nowInKst,
  removeExpiredDramaMembers,
  saveDramaAccountFromText,
  toAccountMemo,
  toMemberView,
} = await import('./dramaAccountService')

const MEMO = [
  '[2026-08-29]-릴숏 3인',
  'sample@gmail.com',
  'pw1234',
  'otpsecretotpsecret1234',
  '(스트림포켓 경원 - 2026.08.05/01:30 7일)',
  '(스트림포켓 지은 - 2026.08.05/02:30 7일)',
].join('\n')

/** 편집기를 열 때 화면이 받아 간 버전값 */
const VERSION = '2026-07-29T01:00:00.000Z'

/** 저장된 계정 흉내 (파티원 3명) */
const existing = (over: Record<string, unknown> = {}) => ({
  id: 'acc-1',
  updatedAt: new Date(VERSION),
  email: 'sample@gmail.com',
  passwordEnc: encryptSecret('pw1234'),
  otpSecretEnc: encryptSecret('otpsecretotpsecret1234'),
  platform: '릴숏',
  capacity: 3,
  capacityLabel: '3인',
  dueAt: new Date('2026-08-29T00:00:00.000Z'),
  notes: [],
  members: [{ id: 'm1' }, { id: 'm2' }, { id: 'm3' }],
  ...over,
})

beforeEach(() => {
  vi.clearAllMocks()
  repo.findDramaAccountsByEmails.mockResolvedValue([])
  repo.findDramaAccountById.mockResolvedValue(null)
})

describe('빈 줄 (계정 구분자) 방어', () => {
  it('빈 줄로 두 덩어리가 되면 막고 "메모 붙여넣기"를 안내한다', async () => {
    const two = `${MEMO}\n\n${MEMO.replace('sample', 'other')}`
    await expect(saveDramaAccountFromText({ text: two, dryRun: true })).rejects.toThrow(
      /빈 줄은 계정을 나누는 구분자/,
    )
  })

  it('내용이 비면 막는다', async () => {
    await expect(saveDramaAccountFromText({ text: '   \n  ', dryRun: true })).rejects.toThrow(
      /읽을 수 있는 내용이 없습니다/,
    )
  })
})

describe('파싱 오류는 저장하지 않는다', () => {
  it('이메일 줄이 없으면 막는다', async () => {
    await expect(
      saveDramaAccountFromText({ text: 'pw1234\notpsecretotpsecret1234', dryRun: false }),
    ).rejects.toThrow(/이메일/)
    expect(repo.createDramaAccount).not.toHaveBeenCalled()
  })
})

describe('이메일 중복', () => {
  it('다른 계정이 쓰는 이메일이면 막는다', async () => {
    repo.findDramaAccountsByEmails.mockResolvedValue([{ id: 'other', email: 'sample@gmail.com' }])
    await expect(saveDramaAccountFromText({ text: MEMO, dryRun: true })).rejects.toThrow(
      /이미 등록된 이메일/,
    )
  })

  it('수정 중인 계정 자기 자신의 이메일은 중복이 아니다', async () => {
    repo.findDramaAccountById.mockResolvedValue(existing())
    repo.findDramaAccountsByEmails.mockResolvedValue([{ id: 'acc-1', email: 'sample@gmail.com' }])
    const result = await saveDramaAccountFromText({ id: 'acc-1', text: MEMO, dryRun: true })
    expect(result.dryRun).toBe(true)
  })
})

describe('없는 계정', () => {
  it('id가 있는데 계정이 없으면 404', async () => {
    repo.findDramaAccountById.mockResolvedValue(null)
    await expect(
      saveDramaAccountFromText({ id: 'missing', text: MEMO, dryRun: true }),
    ).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('dryRun', () => {
  it('저장 함수를 호출하지 않는다', async () => {
    await saveDramaAccountFromText({ text: MEMO, dryRun: true })
    expect(repo.createDramaAccount).not.toHaveBeenCalled()
    expect(repo.replaceDramaAccount).not.toHaveBeenCalled()
  })
})

describe('변화 요약 (실수로 줄을 지운 걸 눈치채게 하는 값)', () => {
  it('파티원이 줄어든 것을 전/후로 보여준다', async () => {
    repo.findDramaAccountById.mockResolvedValue(existing()) // 3명
    const { diff } = await saveDramaAccountFromText({ id: 'acc-1', text: MEMO, dryRun: true }) // 2명
    expect(diff.membersBefore).toBe(3)
    expect(diff.membersAfter).toBe(2)
  })

  it('신규 등록이면 이전 값이 null이다', async () => {
    const { diff } = await saveDramaAccountFromText({ text: MEMO, dryRun: true })
    expect(diff.membersBefore).toBeNull()
    expect(diff.emailBefore).toBeNull()
    expect(diff.headAfter).toBe('[2026-08-29]-릴숏 3인')
  })

  it('헤더가 바뀌면 전/후가 다르게 나온다', async () => {
    repo.findDramaAccountById.mockResolvedValue(
      existing({ capacityLabel: '프라이빗', capacity: 1, platform: '비글' }),
    )
    const { diff } = await saveDramaAccountFromText({ id: 'acc-1', text: MEMO, dryRun: true })
    expect(diff.headBefore).toBe('[2026-08-29]-비글 프라이빗')
    expect(diff.headAfter).toBe('[2026-08-29]-릴숏 3인')
  })
})

describe('실제 저장', () => {
  it('신규는 create, 수정은 replace를 부른다 (파티원 통째 교체)', async () => {
    repo.createDramaAccount.mockResolvedValue(existing({ members: [] }))
    await saveDramaAccountFromText({ text: MEMO, dryRun: false })
    expect(repo.createDramaAccount).toHaveBeenCalledTimes(1)

    vi.clearAllMocks()
    repo.findDramaAccountsByEmails.mockResolvedValue([])
    repo.findDramaAccountById.mockResolvedValue(existing())
    repo.replaceDramaAccount.mockResolvedValue(existing({ members: [] }))
    await saveDramaAccountFromText({ id: 'acc-1', text: MEMO, dryRun: false, expectedUpdatedAt: VERSION })
    expect(repo.replaceDramaAccount).toHaveBeenCalledTimes(1)
    expect(repo.createDramaAccount).not.toHaveBeenCalled()
  })

  it('비밀번호·OTP를 평문으로 넘기지 않는다 (암호문만 저장)', async () => {
    repo.createDramaAccount.mockResolvedValue(existing({ members: [] }))
    await saveDramaAccountFromText({ text: MEMO, dryRun: false })
    const [accountData] = repo.createDramaAccount.mock.calls[0]
    expect(accountData.passwordEnc).toMatch(/^v1:/)
    expect(accountData.otpSecretEnc).toMatch(/^v1:/)
    expect(JSON.stringify(accountData)).not.toContain('pw1234')
    expect(JSON.stringify(accountData)).not.toContain('otpsecretotpsecret1234')
  })

  it('메모 원문(정원 표기·꼬리·메모 줄)을 그대로 저장한다', async () => {
    const memo = [
      '[2026-08-06]-비글 프라이빗',
      'sample@gmail.com',
      'pw1234',
      'otpsecretotpsecret1234',
      '(중고나라#7561308 - 2026.08.05/01:30 7일)',
      '(스트림포켓 이슬 - 2026.08.25/17:30 30일)-갤s26',
      '(로그아웃완료)',
    ].join('\n')
    repo.createDramaAccount.mockResolvedValue(existing({ members: [] }))
    await saveDramaAccountFromText({ text: memo, dryRun: false })

    const [accountData, members] = repo.createDramaAccount.mock.calls[0]
    expect(accountData.capacityLabel).toBe('프라이빗')
    expect(accountData.capacity).toBe(1)
    expect(accountData.notes).toEqual(['(로그아웃완료)'])
    expect(members[0]).toMatchObject({ site: '중고나라', name: '#7561308', siteSpaced: false })
    expect(members[1]).toMatchObject({ suffix: '-갤s26' })
  })
})

// 저장이 파티원 통째 교체라, 편집기를 열어둔 사이 다른 관리자가 파티원을 추가하면
// 그 변경이 알림 없이 사라진다. 그래서 열 때 본 버전과 같을 때만 저장한다.
describe('동시 수정 방어 (낙관적 잠금)', () => {
  it('편집기가 본 버전을 저장소에 그대로 넘긴다', async () => {
    repo.findDramaAccountById.mockResolvedValue(existing())
    repo.replaceDramaAccount.mockResolvedValue(existing({ members: [] }))
    await saveDramaAccountFromText({ id: 'acc-1', text: MEMO, dryRun: false, expectedUpdatedAt: VERSION })

    const [, , , expected] = repo.replaceDramaAccount.mock.calls[0]
    expect(expected).toEqual(new Date(VERSION))
  })

  it('그 사이 바뀌었으면(저장소가 null) 409로 막는다', async () => {
    repo.findDramaAccountById.mockResolvedValue(existing())
    repo.replaceDramaAccount.mockResolvedValue(null) // 조건부 갱신 0건 = 남이 먼저 저장했다
    await expect(
      saveDramaAccountFromText({ id: 'acc-1', text: MEMO, dryRun: false, expectedUpdatedAt: VERSION }),
    ).rejects.toMatchObject({ statusCode: 409 })
  })

  it('버전 없이 수정 저장하면 막는다 (검사를 건너뛰지 않는다)', async () => {
    repo.findDramaAccountById.mockResolvedValue(existing())
    await expect(
      saveDramaAccountFromText({ id: 'acc-1', text: MEMO, dryRun: false }),
    ).rejects.toMatchObject({ statusCode: 400 })
    expect(repo.replaceDramaAccount).not.toHaveBeenCalled()
  })

  it('버전 형식이 깨졌으면 막는다', async () => {
    repo.findDramaAccountById.mockResolvedValue(existing())
    await expect(
      saveDramaAccountFromText({ id: 'acc-1', text: MEMO, dryRun: false, expectedUpdatedAt: '어제' }),
    ).rejects.toMatchObject({ statusCode: 400 })
    expect(repo.replaceDramaAccount).not.toHaveBeenCalled()
  })

  it('신규 등록은 버전 없이도 저장된다 (덮어쓸 대상이 없다)', async () => {
    repo.createDramaAccount.mockResolvedValue(existing({ members: [] }))
    await saveDramaAccountFromText({ text: MEMO, dryRun: false })
    expect(repo.createDramaAccount).toHaveBeenCalledTimes(1)
  })

  it('미리보기(dryRun)는 버전을 요구하지 않는다 — 저장하지 않기 때문', async () => {
    repo.findDramaAccountById.mockResolvedValue(existing())
    const result = await saveDramaAccountFromText({ id: 'acc-1', text: MEMO, dryRun: true })
    expect(result.dryRun).toBe(true)
  })

  it('조회 응답에 버전값을 함께 내려준다 (화면이 이걸 들고 있다가 되돌려준다)', async () => {
    repo.createDramaAccount.mockResolvedValue(existing({ members: [] }))
    const { account } = await saveDramaAccountFromText({ text: MEMO, dryRun: false })
    expect(account?.updatedAt).toBe(VERSION)
  })
})

// 파티원의 startTime이 곧 만료 시각이다. 날짜로만 지우면 오늘 01:30에 끝난 자리가
// 하루 종일 남아, 화면이 세는 "만료 N명"과 실제로 지워지는 수가 어긋난다.
describe('만료 파티원 정리 — 시각 기준', () => {
  beforeEach(() => {
    repo.deleteExpiredDramaMembers.mockResolvedValue({ count: 0 })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  /** UTC 시각을 고정하고 그때의 KST 기준값을 얻는다 */
  const atUtc = (iso: string) => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(iso))
    return nowInKst()
  }

  it('KST 자정 직후에도 날짜가 하루 밀리지 않는다', () => {
    // UTC 08-05 15:30 = KST 08-06 00:30
    const now = atUtc('2026-08-05T15:30:00.000Z')
    expect(now.date.toISOString().slice(0, 10)).toBe('2026-08-06')
    expect(now.hhmm).toBe('00:30')
  })

  it('KST 자정 직전은 아직 전날이다', () => {
    // UTC 08-05 14:30 = KST 08-05 23:30
    const now = atUtc('2026-08-05T14:30:00.000Z')
    expect(now.date.toISOString().slice(0, 10)).toBe('2026-08-05')
    expect(now.hhmm).toBe('23:30')
  })

  it('시각을 0채움 두 자리로 준다 (파티원 startTime과 같은 형식이라야 문자열 비교가 성립)', () => {
    // UTC 08-05 00:05 = KST 08-05 09:05
    const now = atUtc('2026-08-05T00:05:00.000Z')
    expect(now.hhmm).toBe('09:05')
  })

  it('저장소에 KST 날짜와 시각을 함께 넘긴다', async () => {
    repo.findDramaAccountById.mockResolvedValue(existing())
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-05T04:20:00.000Z')) // KST 13:20

    await removeExpiredDramaMembers('acc-1')

    const [accountId, date, hhmm] = repo.deleteExpiredDramaMembers.mock.calls[0]
    expect(accountId).toBe('acc-1')
    expect(date.toISOString().slice(0, 10)).toBe('2026-08-05')
    expect(hhmm).toBe('13:20')
  })

  it('없는 계정이면 404 (지우기 전에 막는다)', async () => {
    repo.findDramaAccountById.mockResolvedValue(null)
    await expect(removeExpiredDramaMembers('missing')).rejects.toMatchObject({ statusCode: 404 })
    expect(repo.deleteExpiredDramaMembers).not.toHaveBeenCalled()
  })
})

// ── 응답 조립 (toMemberView / toView / toAccountMemo) ──────────────────
//
// 이 구역은 **원래 비어 있던 공백**을 메운다. 위 케이스들은 전부 저장 경로만 검증하고
// (변화 요약·암호문 저장·파서 출력), listDramaAccounts/toView를 호출하는 케이스가 없었다.
// 그 증거가 위 `existing()` 픽스처다 — 파티원에 id만 있어 toView를 태우면 터진다.
//
// 파티원 매핑을 toMemberView로 빼내 신청 관리와 공유하게 됐으므로,
// 그 추출이 GET /own/admin/drama-accounts 응답을 바꾸지 않음을 여기서 고정한다.

/** 8필드를 모두 채운 파티원 — toView/메모 뷰를 태울 수 있는 픽스처 */
const memberRow = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  site: '스트림포켓',
  name: '경원',
  siteSpaced: true,
  endDate: new Date('2026-08-05T00:00:00.000Z'),
  startTime: '01:30',
  days: 7,
  suffix: null,
  ...over,
})

/** 파티원이 채워진 계정 — existing()은 파티원에 id만 있어 여기선 쓸 수 없다 */
const accountRow = (over: Record<string, unknown> = {}) => ({
  ...existing(),
  members: [memberRow()],
  ...over,
})

describe('toMemberView — 파티원 행 → 응답 DTO', () => {
  it('endDate를 KST YYYY-MM-DD 문자열로 바꾸고 나머지는 그대로 싣는다', () => {
    expect(toMemberView(memberRow())).toEqual({
      id: 'm1',
      site: '스트림포켓',
      name: '경원',
      siteSpaced: true,
      endDate: '2026-08-05',
      startTime: '01:30',
      days: 7,
      suffix: null,
    })
  })

  it('사이트 없음·공백 없음·괄호 꼬리 같은 원문 표기를 보존한다', () => {
    const view = toMemberView(
      memberRow({ site: null, name: '#7561308', siteSpaced: false, suffix: '-갤s26' }),
    )
    expect(view.site).toBeNull()
    expect(view.siteSpaced).toBe(false)
    expect(view.suffix).toBe('-갤s26')
  })

  it("startTime은 'HH:mm' 5자리를 그대로 둔다 (사전순 = 시간순이라 가공하면 정렬이 깨진다)", () => {
    expect(toMemberView(memberRow({ startTime: '00:05' })).startTime).toBe('00:05')
  })
})

describe('toView — 드라마 계정 관리 응답 (toMemberView 추출 후에도 같아야 한다)', () => {
  it('계정·파티원 전 필드를 기존과 똑같이 내려준다', async () => {
    repo.findAllDramaAccounts.mockResolvedValue([accountRow()])

    const [view] = await listDramaAccounts()

    expect(view).toEqual({
      id: 'acc-1',
      email: 'sample@gmail.com',
      // 저장은 암호문이지만 응답은 평문이다 (화면이 메모장처럼 그대로 보여주는 요구사항)
      password: 'pw1234',
      otpSecret: 'otpsecretotpsecret1234',
      platform: '릴숏',
      capacity: 3,
      capacityLabel: '3인',
      dueAt: '2026-08-29',
      notes: [],
      updatedAt: VERSION,
      members: [
        {
          id: 'm1',
          site: '스트림포켓',
          name: '경원',
          siteSpaced: true,
          endDate: '2026-08-05',
          startTime: '01:30',
          days: 7,
          suffix: null,
        },
      ],
    })
  })

  it('멤버십 미개설 계정(platform·capacity·dueAt null)도 그대로 내려준다', async () => {
    repo.findAllDramaAccounts.mockResolvedValue([
      accountRow({ platform: null, capacity: null, capacityLabel: null, dueAt: null, members: [] }),
    ])

    const [view] = await listDramaAccounts()

    expect(view).toMatchObject({
      platform: null,
      capacity: null,
      capacityLabel: null,
      dueAt: null,
      members: [],
    })
  })
})

describe('toAccountMemo — 메모 원문 재현용 뷰', () => {
  it('정원 표기·메모 줄·파티원만 담는다', () => {
    expect(toAccountMemo(accountRow({ notes: ['(로그아웃완료)'] }))).toEqual({
      capacity: 3,
      capacityLabel: '3인',
      notes: ['(로그아웃완료)'],
      members: [
        {
          id: 'm1',
          site: '스트림포켓',
          name: '경원',
          siteSpaced: true,
          endDate: '2026-08-05',
          startTime: '01:30',
          days: 7,
          suffix: null,
        },
      ],
    })
  })

  it('자격증명을 복호화하지 않는다 (평문이 메모리에 뜨는 구간을 늘리지 않는다)', () => {
    const memo = toAccountMemo(accountRow())
    expect(memo).not.toHaveProperty('password')
    expect(memo).not.toHaveProperty('otpSecret')
    expect(memo).not.toHaveProperty('email')
  })

  it('파티원이 0명이면 빈 배열', () => {
    expect(toAccountMemo(accountRow({ members: [] })).members).toEqual([])
  })

  it('멤버십 미개설이면 capacity·capacityLabel이 null로 나간다', () => {
    expect(toAccountMemo(accountRow({ capacity: null, capacityLabel: null }))).toMatchObject({
      capacity: null,
      capacityLabel: null,
    })
  })
})

describe('loadAccountMemo — 계정 id로 메모 뷰 조회', () => {
  it('계정을 찾으면 메모 뷰를 돌려준다', async () => {
    repo.findDramaAccountById.mockResolvedValue(accountRow())
    const memo = await loadAccountMemo('acc-1')
    expect(memo?.capacityLabel).toBe('3인')
    expect(memo?.members).toHaveLength(1)
  })

  it('계정이 없으면 null (링크를 읽은 직후 삭제된 경우 화면이 폴백으로 떨어진다)', async () => {
    repo.findDramaAccountById.mockResolvedValue(null)
    await expect(loadAccountMemo('gone')).resolves.toBeNull()
  })
})
