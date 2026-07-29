import { beforeEach, describe, expect, it, vi } from 'vitest'

// 저장소는 모킹한다 — 여기서 고정하려는 건 DB 동작이 아니라
// "언제 막고 언제 저장하는가"라는 판단 규칙이다.
const repo = vi.hoisted(() => ({
  findDramaAccountById: vi.fn(),
  findDramaAccountsByEmails: vi.fn(),
  createDramaAccount: vi.fn(),
  replaceDramaAccount: vi.fn(),
}))

vi.mock('../../repositories/own/dramaAccountRepository', () => ({
  ...repo,
  findAllDramaAccounts: vi.fn(),
  createDramaAccountsBulk: vi.fn(),
  deleteDramaAccountById: vi.fn(),
  deleteDramaMember: vi.fn(),
  deleteExpiredDramaMembers: vi.fn(),
}))

// 암호화는 실제 구현을 쓴다 (키만 테스트용으로 준다).
// 저장 경로가 응답을 만들며 복호화하므로 모킹 반환값도 진짜 암호문이어야 한다.
process.env['OTP_SECRET_ENC_KEY'] = 'a'.repeat(64)

const { encryptSecret } = await import('../../lib/crypto')
const { saveDramaAccountFromText } = await import('./dramaAccountService')

const MEMO = [
  '[2026-08-29]-릴숏 3인',
  'sample@gmail.com',
  'pw1234',
  'otpsecretotpsecret1234',
  '(스트림포켓 경원 - 2026.08.05/01:30 7일)',
  '(스트림포켓 지은 - 2026.08.05/02:30 7일)',
].join('\n')

/** 저장된 계정 흉내 (파티원 3명) */
const existing = (over: Record<string, unknown> = {}) => ({
  id: 'acc-1',
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
    await saveDramaAccountFromText({ id: 'acc-1', text: MEMO, dryRun: false })
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
