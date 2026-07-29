// 드라마 계정 메모장 파서 — 사용자가 수년간 써 온 메모 형식을 구조화한다.
//
// 표준 형태:
//   [2026-08-29]-릴숏 3인                     ← 멤버십 마감일 · 플랫폼 · 정원
//   virginiahickma3123846@gmail.com           ← 계정 아이디
//   JcR1322TJe                                ← 비밀번호
//   c6dlaebtb34qnw5q3n3j13123mg               ← OTP 시크릿
//   (스트림포켓 경원 - 2026.08.05/01:30 7일)   ← 사이트·이름·만료일/시각·기간
//
// 실제 메모 171건을 통과시켜 확인한 변형들을 모두 받아들인다. 자세한 근거는
// `기획서/드라마-계정-관리.md`의 "파싱 규칙" 표 참고. 화면이 원문과 글자까지 같아야 하므로
// 정원 표기·괄호 뒤 꼬리·파티원이 아닌 괄호 줄을 원문 그대로 보존한다.

/** 신청 사이트로 인정하는 접두어. 여기에 없으면 앞부분 전체를 이름으로 본다.
 *  ("상담하는 죠르디" 같은 카카오톡 기본 닉네임이 사이트로 잘못 잘리던 문제) */
export const KNOWN_SITES = ['스트림포켓', '중고나라', '오픈챗', '오픈채팅'] as const

/** "프라이빗" 계열 정원 표기 — 전부 정원 1로 계산하되 표기는 원문을 유지한다 */
const PRIVATE_LABELS = ['프라이빗', '1인전용', '개인'] as const

const RE_HEAD = /^\[(\d{4})[-.](\d{1,2})[-.](\d{1,2})\]\s*[-–]?\s*(.+?)\s*$/
// 괄호 뒤 기기 메모( ")-갤s26", ") 아이폰" )와 괄호 중복( "))" )까지 흡수한다
const RE_MEMBER =
  /^\(\s*(.*?)\s*[-–]\s*(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})\s*\/\s*(\d{1,2}:\d{2})\s+(\d+)\s*일\s*\)(.*)$/
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RE_OTP_SECRET = /^[A-Za-z0-9]{16,}$/

export type ParsedMember = {
  site: string | null
  name: string
  /** 사이트와 이름 사이 공백 유무 — "중고나라#7561308"처럼 붙여 쓴 원문을 되돌리기 위해 보존 */
  siteSpaced: boolean
  /** 'YYYY-MM-DD' — 만료일 */
  endDate: string
  /** 'HH:mm' — 시작 시각이자 만료 시각 */
  startTime: string
  days: number
  /** 닫는 괄호 뒤 원문 꼬리 ("-갤s26", " 아이폰"). 없으면 null */
  suffix: string | null
}

export type ParsedAccount = {
  /** 입력 순서 (1부터). 미리보기에서 몇 번째 블록인지 표시용 */
  index: number
  email: string | null
  password: string | null
  otpSecret: string | null
  platform: string | null
  capacity: number | null
  /** "3인" / "프라이빗" — 화면에 그대로 출력할 원문 */
  capacityLabel: string | null
  /** 'YYYY-MM-DD' — 멤버십 마감일 */
  dueAt: string | null
  members: ParsedMember[]
  /** 파티원 형식이 아닌 괄호 줄 등 — 버리지 않고 보존 */
  notes: string[]
  /** 이 블록은 등록할 수 없다 */
  errors: string[]
  /** 등록은 되지만 사람이 확인하는 게 좋다 */
  warnings: string[]
}

const pad2 = (n: number): string => String(n).padStart(2, '0')

/** "비글 3인" / "비글 프라이빗" → 플랫폼과 정원 분리. 정원 표기는 원문을 그대로 남긴다 */
function parseCapacity(rest: string): Pick<ParsedAccount, 'platform' | 'capacity' | 'capacityLabel'> {
  const numeric = rest.match(/^(.*?)\s*(\d+)\s*인$/)
  if (numeric) {
    return { platform: numeric[1].trim(), capacity: Number(numeric[2]), capacityLabel: `${numeric[2]}인` }
  }
  const priv = rest.match(new RegExp(`^(.*?)\\s*(${PRIVATE_LABELS.join('|')})$`))
  if (priv) {
    return { platform: priv[1].trim(), capacity: 1, capacityLabel: priv[2] }
  }
  // 정원 표기를 못 읽어도 플랫폼은 살린다 (빈자리 계산만 못 하고 목록에는 나온다)
  return { platform: rest.trim(), capacity: null, capacityLabel: null }
}

/** "스트림포켓 김가은" → 사이트+이름 / "상담하는 죠르디" → 이름만 / "중고나라#7561308" → 접두 분리(공백 없음) */
export function splitSiteAndName(raw: string): { site: string | null; name: string; siteSpaced: boolean } {
  for (const site of KNOWN_SITES) {
    if (raw === site) return { site, name: '', siteSpaced: false }
    if (raw.startsWith(site)) {
      const rest = raw.slice(site.length)
      return { site, name: rest.trim(), siteSpaced: /^\s/.test(rest) }
    }
  }
  return { site: null, name: raw, siteSpaced: false }
}

function parseBlock(block: string, index: number): ParsedAccount {
  const lines = block
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const acc: ParsedAccount = {
    index,
    email: null,
    password: null,
    otpSecret: null,
    platform: null,
    capacity: null,
    capacityLabel: null,
    dueAt: null,
    members: [],
    notes: [],
    errors: [],
    warnings: [],
  }
  const credentials: string[] = []

  for (const line of lines) {
    const head = line.match(RE_HEAD)
    if (head) {
      acc.dueAt = `${head[1]}-${pad2(Number(head[2]))}-${pad2(Number(head[3]))}`
      const cap = parseCapacity(head[4])
      acc.platform = cap.platform
      acc.capacity = cap.capacity
      acc.capacityLabel = cap.capacityLabel
      continue
    }

    const member = line.match(RE_MEMBER)
    if (member) {
      const { site, name, siteSpaced } = splitSiteAndName(member[1])
      acc.members.push({
        site,
        name,
        siteSpaced,
        endDate: `${member[2]}-${pad2(Number(member[3]))}-${pad2(Number(member[4]))}`,
        startTime: member[5].padStart(5, '0'),
        days: Number(member[6]),
        suffix: member[7] ? member[7] : null,
      })
      continue
    }

    // 괄호로 시작하는데 파티원 형식이 아닌 줄 = 상태 메모 "(로그아웃완료)".
    // 자격증명 자리를 차지하지 않도록 여기서 분리한다.
    if (line.startsWith('(')) {
      acc.notes.push(line)
      continue
    }

    credentials.push(line)
  }

  // 자격증명은 이메일 → 비밀번호 → OTP 순. 이메일만 형식으로 찾고 나머지는 순서를 따른다.
  acc.email = credentials.find((line) => RE_EMAIL.test(line)) ?? null
  const rest = credentials.filter((line) => line !== acc.email)
  acc.password = rest[0] ?? null
  acc.otpSecret = rest[1] ?? null
  acc.notes.push(...rest.slice(2))

  if (!acc.email) acc.errors.push('이메일(계정 아이디)을 찾지 못했습니다')
  if (!acc.password) acc.errors.push('비밀번호 줄이 없습니다')
  if (!acc.otpSecret) acc.errors.push('OTP 시크릿 줄이 없습니다')
  else if (!RE_OTP_SECRET.test(acc.otpSecret)) {
    acc.warnings.push(`OTP 시크릿 형태가 이상합니다 — ${acc.otpSecret}`)
  }
  if (acc.capacity !== null && acc.members.length > acc.capacity) {
    acc.warnings.push(
      `정원 ${acc.capacityLabel ?? acc.capacity}인데 파티원이 ${acc.members.length}명입니다 (만료자가 남아 있을 수 있음)`,
    )
  }
  const noSite = acc.members.filter((m) => !m.site).length
  if (noSite > 0) acc.warnings.push(`사이트를 못 찾은 파티원 ${noSite}명 — 이름만 저장합니다`)

  return acc
}

/** 메모장 전문을 계정 목록으로 변환한다. 계정 구분은 빈 줄. */
export function parseDramaMemo(text: string): ParsedAccount[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, i) => parseBlock(block, i + 1))
}

/** 사이트+이름을 메모 원문의 표기로 되돌린다 ("중고나라#7561308"은 공백 없이 붙는다) */
export function formatMemberWho(member: Pick<ParsedMember, 'site' | 'name' | 'siteSpaced'>): string {
  if (!member.site) return member.name
  return `${member.site}${member.siteSpaced ? ' ' : ''}${member.name}`
}

/** 저장된 파티원을 메모 원문 한 줄로 되돌린다 — 화면 출력과 원문 대조에 쓴다 */
export function formatMemberLine(member: ParsedMember): string {
  const date = member.endDate.replace(/-/g, '.')
  return `(${formatMemberWho(member)} - ${date}/${member.startTime} ${member.days}일)${member.suffix ?? ''}`
}

export function formatHeadLine(acc: Pick<ParsedAccount, 'dueAt' | 'platform' | 'capacityLabel'>): string | null {
  if (!acc.dueAt || !acc.platform) return null
  return `[${acc.dueAt}]-${acc.platform}${acc.capacityLabel ? ` ${acc.capacityLabel}` : ''}`
}
