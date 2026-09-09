import { decryptSecret, encryptSecret } from '../../lib/crypto'
import {
  createDramaAccount,
  createDramaAccountsBulk,
  deleteDramaAccountById,
  deleteDramaMember,
  deleteExpiredDramaMembers,
  findAllDramaAccounts,
  findDramaAccountById,
  findDramaAccountsByEmails,
  replaceDramaAccount,
  type DramaAccountWithMembers,
  type DramaMemberWriteData,
} from '../../repositories/own/dramaAccountRepository'
import { parseDramaMemo, type ParsedAccount } from '../../utils/dramaMemoParser'
import { kstMomentOf, toDateOnly, toDateString, type KstMoment } from '../../utils/kstDate'

// 드라마 계정 — 비밀번호·OTP 시크릿은 AES-256-GCM으로 저장하고 조회 시 복호화해 내려준다.
// 화면이 메모장처럼 평문을 그대로 보여주는 것이 요구사항이라 마스킹하지 않는다.

const notFound = (what: string) => Object.assign(new Error(`${what}을(를) 찾을 수 없습니다.`), { statusCode: 404 })
const badRequest = (message: string) => Object.assign(new Error(message), { statusCode: 400 })
const conflict = (message: string) => Object.assign(new Error(message), { statusCode: 409 })

export type DramaMemberView = {
  id: string
  site: string | null
  name: string
  siteSpaced: boolean
  /** 'YYYY-MM-DD' */
  endDate: string
  startTime: string
  days: number
  suffix: string | null
}

export type DramaAccountView = {
  id: string
  email: string
  password: string
  otpSecret: string
  platform: string | null
  capacity: number | null
  capacityLabel: string | null
  /** 'YYYY-MM-DD' */
  dueAt: string | null
  notes: string[]
  /** 낙관적 잠금용 버전값 — 편집기를 열 때 받아 저장할 때 그대로 돌려보낸다 */
  updatedAt: string
  members: DramaMemberView[]
}

/** KST 기준 오늘(UTC 자정 Date) — 만료 판정 기준일 */
export function todayInKst(): Date {
  return kstMomentOf(new Date()).date
}

/**
 * KST 기준 지금 — 날짜와 시각을 함께 돌려준다.
 *
 * 파티원 만료는 날짜뿐 아니라 `startTime`(= 만료 시각)까지 봐야 한다.
 * 날짜만 보면 오늘 01:30에 끝난 자리가 하루 종일 차 있는 것으로 남는다.
 * `hhmm`은 `DramaMember.startTime`과 같은 'HH:mm' 5자리라 문자열 비교가 곧 시간 비교다.
 */
export function nowInKst(): KstMoment {
  return kstMomentOf(new Date())
}

function toView(account: DramaAccountWithMembers): DramaAccountView {
  return {
    id: account.id,
    email: account.email,
    password: decryptSecret(account.passwordEnc),
    otpSecret: decryptSecret(account.otpSecretEnc),
    platform: account.platform,
    capacity: account.capacity,
    capacityLabel: account.capacityLabel,
    dueAt: account.dueAt ? toDateString(account.dueAt) : null,
    notes: account.notes,
    updatedAt: account.updatedAt.toISOString(),
    members: account.members.map((m) => ({
      id: m.id,
      site: m.site,
      name: m.name,
      siteSpaced: m.siteSpaced,
      endDate: toDateString(m.endDate),
      startTime: m.startTime,
      days: m.days,
      suffix: m.suffix,
    })),
  }
}

export async function listDramaAccounts(): Promise<DramaAccountView[]> {
  const accounts = await findAllDramaAccounts()
  return accounts.map(toView)
}

/** 파서가 읽은 파티원 → 저장용 데이터 */
type DramaMemberInput = {
  site?: string | null
  name: string
  siteSpaced?: boolean
  endDate: string
  startTime: string
  days: number
  suffix?: string | null
}

function toMemberWrite(input: DramaMemberInput): DramaMemberWriteData {
  return {
    site: input.site ?? null,
    name: input.name,
    siteSpaced: input.siteSpaced ?? true,
    endDate: toDateOnly(input.endDate),
    startTime: input.startTime,
    days: input.days,
    suffix: input.suffix ?? null,
  }
}

// ── 메모 텍스트로 계정 1건 저장 ────────────────────────────
// 화면이 메모장 형태이므로 수정도 텍스트 한 덩어리로 받는다.
// 저장은 줄 단위 대조가 아니라 통째 교체다 — 이름·날짜를 자유롭게 고칠 수 있어
// "이 줄이 아까 그 파티원"임을 확실히 짝지을 키가 없기 때문이다.

export type TextSaveDiff = {
  membersBefore: number | null
  membersAfter: number
  emailBefore: string | null
  emailAfter: string
  headBefore: string | null
  headAfter: string | null
}

export type TextSaveResult = {
  dryRun: boolean
  parsed: ParsedAccount
  diff: TextSaveDiff
  /** 실제 저장했을 때만 채워진다 */
  account?: DramaAccountView
}

/** 저장된 계정을 메모 헤더 한 줄로 되돌린다 (변화 요약 표시용) */
function headLineOf(account: { dueAt: Date | null; platform: string | null; capacityLabel: string | null }): string | null {
  if (!account.dueAt || !account.platform) return null
  return `[${toDateString(account.dueAt)}]-${account.platform}${account.capacityLabel ? ` ${account.capacityLabel}` : ''}`
}

export async function saveDramaAccountFromText(input: {
  /** 없으면 신규 등록, 있으면 그 계정을 통째로 교체 */
  id?: string
  text: string
  dryRun: boolean
  /** 편집기를 열 때 받은 updatedAt(ISO). 수정 저장에는 필수 — 그 사이 바뀌었으면 409 */
  expectedUpdatedAt?: string
}): Promise<TextSaveResult> {
  const blocks = parseDramaMemo(input.text)
  if (blocks.length === 0) throw badRequest('읽을 수 있는 내용이 없습니다.')
  // 메모 형식에서 빈 줄은 계정 구분자다. 1건 편집기가 조용히 계정을 늘리면 위험하므로 막는다.
  if (blocks.length > 1) {
    throw badRequest('빈 줄은 계정을 나누는 구분자입니다. 여러 계정을 한 번에 넣으려면 "메모 붙여넣기"를 사용해 주세요.')
  }

  const parsed = blocks[0]
  if (parsed.errors.length > 0) throw badRequest(parsed.errors.join(' / '))
  if (!parsed.email || !parsed.password || !parsed.otpSecret) {
    throw badRequest('아이디·비밀번호·OTP 시크릿 줄이 모두 있어야 합니다.')
  }

  const current = input.id ? await findDramaAccountById(input.id) : null
  if (input.id && !current) throw notFound('계정')

  // 이메일 중복 — 수정 중인 계정 자기 자신은 중복이 아니다
  const [duplicate] = await findDramaAccountsByEmails([parsed.email])
  if (duplicate && duplicate.id !== input.id) throw badRequest('이미 등록된 이메일입니다.')

  const diff: TextSaveDiff = {
    membersBefore: current ? current.members.length : null,
    membersAfter: parsed.members.length,
    emailBefore: current ? current.email : null,
    emailAfter: parsed.email,
    headBefore: current ? headLineOf(current) : null,
    headAfter: parsed.platform && parsed.dueAt
      ? `[${parsed.dueAt}]-${parsed.platform}${parsed.capacityLabel ? ` ${parsed.capacityLabel}` : ''}`
      : null,
  }

  if (input.dryRun) return { dryRun: true, parsed, diff }

  // 저장은 통째 교체라 남의 변경을 덮어쓸 수 있다. 편집기를 열 때 본 버전을 반드시 확인한다.
  let expected: Date | null = null
  if (current) {
    if (!input.expectedUpdatedAt) {
      throw badRequest('편집 중이던 내용이 오래되었습니다. 창을 닫고 다시 열어주세요.')
    }
    expected = new Date(input.expectedUpdatedAt)
    if (Number.isNaN(expected.getTime())) throw badRequest('올바른 버전 정보가 아닙니다.')
  }

  const accountData = {
    email: parsed.email,
    passwordEnc: encryptSecret(parsed.password),
    otpSecretEnc: encryptSecret(parsed.otpSecret),
    platform: parsed.platform,
    capacity: parsed.capacity,
    capacityLabel: parsed.capacityLabel,
    dueAt: parsed.dueAt ? toDateOnly(parsed.dueAt) : null,
    notes: parsed.notes,
  }
  const members = parsed.members.map((m) => toMemberWrite(m))

  const saved =
    current && expected
      ? await replaceDramaAccount(current.id, accountData, members, expected)
      : await createDramaAccount(accountData, members)

  // null = 그 사이 다른 관리자가 먼저 저장했다. 덮어쓰면 그쪽 변경이 조용히 사라진다.
  if (!saved) throw conflict('다른 관리자가 먼저 수정했습니다. 창을 닫고 다시 열어주세요.')

  return { dryRun: false, parsed, diff, account: toView(saved) }
}

export async function removeDramaAccount(id: string): Promise<void> {
  const account = await findDramaAccountById(id)
  if (!account) throw notFound('계정')
  await deleteDramaAccountById(id)
}

export async function removeDramaMember(accountId: string, memberId: string): Promise<void> {
  const { count } = await deleteDramaMember(accountId, memberId)
  if (count === 0) throw notFound('파티원')
}

/**
 * 만료 파티원 일괄 삭제 — 자동 크론이 아니라 관리자가 확인 후 누르는 동작이다.
 * 화면이 만료 시각까지 보고 "만료 N명"을 세므로 삭제도 같은 기준이어야 한다 —
 * 날짜로만 지우면 화면이 말한 수와 실제로 지워진 수가 어긋난다.
 */
export async function removeExpiredDramaMembers(accountId: string): Promise<{ removed: number }> {
  const account = await findDramaAccountById(accountId)
  if (!account) throw notFound('계정')
  const now = nowInKst()
  const { count } = await deleteExpiredDramaMembers(accountId, now.date, now.hhmm)
  return { removed: count }
}

// ── 메모 붙여넣기 이관 ────────────────────────────────────────

export type ImportDuplicateMode = 'skip' | 'overwrite'

export type ImportPreviewItem = ParsedAccount & {
  /** 이미 등록된 이메일인지 */
  duplicate: boolean
}

export type ImportResult = {
  dryRun: boolean
  items: ImportPreviewItem[]
  summary: {
    total: number
    importable: number
    duplicates: number
    errors: number
    warnings: number
    members: number
  }
  /** 실제 저장했을 때만 채워진다 */
  applied?: { created: number; overwritten: number; skipped: number }
}

export async function importDramaMemo(
  text: string,
  options: { dryRun: boolean; duplicateMode: ImportDuplicateMode },
): Promise<ImportResult> {
  const parsed = parseDramaMemo(text)
  if (parsed.length === 0) throw badRequest('읽을 수 있는 계정이 없습니다.')

  const emails = parsed.map((p) => p.email).filter((e): e is string => Boolean(e))
  const existing = await findDramaAccountsByEmails(emails)
  const existingByEmail = new Map(existing.map((e) => [e.email, e.id]))

  const items: ImportPreviewItem[] = parsed.map((p) => ({
    ...p,
    duplicate: p.email ? existingByEmail.has(p.email) : false,
  }))

  const summary = {
    total: items.length,
    importable: items.filter((i) => i.errors.length === 0).length,
    duplicates: items.filter((i) => i.duplicate).length,
    errors: items.filter((i) => i.errors.length > 0).length,
    warnings: items.filter((i) => i.errors.length === 0 && i.warnings.length > 0).length,
    members: items.reduce((sum, i) => sum + i.members.length, 0),
  }

  if (options.dryRun) return { dryRun: true, items, summary }

  // 오류가 있는 블록은 저장하지 않는다. 중복은 모드에 따라 건너뛰거나 덮어쓴다.
  const toCreate: { account: Parameters<typeof createDramaAccount>[0]; members: DramaMemberWriteData[] }[] = []
  const toOverwrite: { id: string; account: Parameters<typeof createDramaAccount>[0]; members: DramaMemberWriteData[] }[] = []
  let skipped = 0

  for (const item of items) {
    if (item.errors.length > 0 || !item.email || !item.password || !item.otpSecret) {
      skipped += 1
      continue
    }
    const account = {
      email: item.email,
      passwordEnc: encryptSecret(item.password),
      otpSecretEnc: encryptSecret(item.otpSecret),
      platform: item.platform,
      capacity: item.capacity,
      capacityLabel: item.capacityLabel,
      dueAt: item.dueAt ? toDateOnly(item.dueAt) : null,
      notes: item.notes,
    }
    const members = item.members.map((m) => toMemberWrite(m))
    const existingId = existingByEmail.get(item.email)

    if (!existingId) {
      toCreate.push({ account, members })
    } else if (options.duplicateMode === 'overwrite') {
      toOverwrite.push({ id: existingId, account, members })
    } else {
      skipped += 1
    }
  }

  if (toCreate.length > 0) await createDramaAccountsBulk(toCreate)
  for (const row of toOverwrite) await replaceDramaAccount(row.id, row.account, row.members)

  return {
    dryRun: false,
    items,
    summary,
    applied: { created: toCreate.length, overwritten: toOverwrite.length, skipped },
  }
}
