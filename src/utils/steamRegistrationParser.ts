// 카카오 챗봇으로 들어온 "스팀 등록 양식" 자유 텍스트를 규칙 기반으로 파싱한다.
// 양식 3종(A/B/C) + 라벨 없이 값만 줄바꿈으로 보내는 경우까지 best-effort로 처리한다.

export type RegistrationFieldKey =
  | 'steamId'
  | 'steamPassword'
  | 'gameName'
  | 'buyerName'
  | 'steamGuardCodes'
  | 'steamGuardDisabled'
  | 'refundConsent'

export type SteamRegistrationFields = {
  steamId: string | null
  steamPassword: string | null
  gameName: string | null
  buyerName: string | null
  steamGuardCodes: string | null
  steamGuardDisabled: boolean | null
  refundConsent: boolean
}

export type SteamRegistrationParseResult = {
  fields: SteamRegistrationFields
  formVariant: string // 'A' | 'B' | 'C' | 'unknown'
  missingFields: RegistrationFieldKey[]
  looksLikeRegistration: boolean // 등록 양식으로 보이는가 (false면 일반 문의)
}

// 필수 항목 — 누락 시 챗봇이 되묻는다. (가드/동의는 양식별로 달라 필수에서 제외)
export const REQUIRED_FIELDS: readonly RegistrationFieldKey[] = [
  'steamId',
  'steamPassword',
  'gameName',
  'buyerName',
]

// 필수 항목의 한국어 라벨 — 챗봇 되묻기 문구에 사용
export const FIELD_LABELS: Record<string, string> = {
  steamId: '스팀 ID',
  steamPassword: '스팀 비밀번호',
  gameName: '구매하신 게임',
  buyerName: '구매자 성함',
  steamGuardCodes: '스팀 가드 코드',
  steamGuardDisabled: '스팀 가드 해제 여부',
  refundConsent: '환불 불가 동의',
}

const FIELD_KEYS: readonly RegistrationFieldKey[] = [
  'steamId',
  'steamPassword',
  'gameName',
  'buyerName',
  'steamGuardCodes',
  'steamGuardDisabled',
  'refundConsent',
]

// 라벨 없는 값만 들어왔을 때 표준 순서대로 채울 필드
const POSITIONAL_ORDER: readonly RegistrationFieldKey[] = [
  'steamId',
  'steamPassword',
  'gameName',
  'buyerName',
]

// 라벨이 하나도 없을 때 "등록 양식"으로 인정하는 최소 줄 수.
// 양식은 최소 ID/PW/게임/성함 4줄 → 1~3줄 자유 텍스트(일반 문의)와 구분한다.
const FORM_MIN_LINES = 4

// 표준 필드키 → 라벨 동의어(정규화된 형태). 부분일치로 표기 변형을 흡수한다.
const LABEL_SYNONYMS: Record<RegistrationFieldKey, readonly string[]> = {
  steamId: ['스팀등록id', '스팀id', '스팀아이디', '등록아이디', '등록id', '아이디', 'id', 'steamid'],
  steamPassword: [
    '스팀등록pw',
    '스팀pw',
    '스팀비밀번호',
    '스팀비번',
    '비밀번호',
    '비번',
    '패스워드',
    'pw',
    'password',
  ],
  gameName: ['구매하신게임', '구매한게임', '구매게임', '게임명', '게임'],
  buyerName: ['구매자성함', '구매자명', '구매자이름', '구매자', '성함', '이름'],
  steamGuardCodes: [
    '1회용steamguard코드',
    'steamguard코드',
    'steam가드코드',
    '스팀가드코드',
    'guard코드',
    '가드코드',
    '인증코드',
    'steamguard',
  ],
  steamGuardDisabled: ['스팀가드해제여부', '가드해제여부', '스팀가드해제', '가드해제'],
  refundConsent: ['환불불가동의', '환불불가', '환불동의'],
}

// 소문자화 후 한글/영문/숫자만 남긴다 (이모지·공백·머리기호·특수문자 제거)
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9가-힣]/g, '')
}

// 헤더·구분선 등 데이터가 아닌 줄 판별
function isNoiseLine(line: string): boolean {
  const normalized = normalize(line)
  if (normalized.length === 0) return true
  if (/^[-=_~ㅡ]+$/.test(line.replace(/\s/g, ''))) return true
  if (normalized.includes('간편접수양식') || normalized.includes('접수양식')) return true
  return false
}

// 한 줄을 라벨/값으로 분해. 콜론(`:` `：`)을 우선 구분자로 사용한다.
function splitLine(line: string): { label: string | null; value: string } {
  const colonMatch = line.match(/[:：]/)
  if (colonMatch && colonMatch.index !== undefined) {
    return {
      label: line.slice(0, colonMatch.index),
      value: line.slice(colonMatch.index + 1).trim(),
    }
  }
  return { label: null, value: line.trim() }
}

// 라벨 없는 값 줄 맨 앞의 목록 기호(`1.` `2)` `①` `-` 등)를 제거한다.
// 숫자는 구분 기호(. ) ])가 뒤따를 때만 제거해 "1234abc" 같은 값이 깎이지 않게 한다.
function stripLeadingMarker(text: string): string {
  return text
    .replace(/^\s*\d{1,2}\s*[.)\]]\s*/, '')
    .replace(/^\s*[①-⑳]\s*/, '')
    .replace(/^\s*[-•·▶►]\s+/, '')
    .trim()
}

// 정규화된 라벨을 표준 필드키로 매칭. 가장 긴(구체적인) 동의어가 우선한다.
function matchFieldKey(normalizedLabel: string): RegistrationFieldKey | null {
  if (normalizedLabel.length === 0) return null
  let best: RegistrationFieldKey | null = null
  let bestLength = 0
  for (const key of FIELD_KEYS) {
    for (const synonym of LABEL_SYNONYMS[key]) {
      if (synonym.length > bestLength && normalizedLabel.includes(synonym)) {
        best = key
        bestLength = synonym.length
      }
    }
  }
  return best
}

// 동의 여부 판정 (부정 표현 우선)
function isAffirmative(value: string): boolean {
  const normalized = normalize(value)
  if (normalized.length === 0) return false
  const negative = ['아니', '미동의', '비동의', '안함', 'no']
  if (negative.some((word) => normalized.includes(word))) return false
  const positive = ['동의', '네', '예', '확인', 'ok']
  return positive.some((word) => normalized.includes(word))
}

// 스팀 가드 해제 여부 판정 (부정 표현 우선, 판단 불가 시 null)
function parseGuardDisabled(value: string): boolean | null {
  const normalized = normalize(value)
  if (normalized.length === 0) return null
  const negative = ['미해제', '안함', '안했', '아니', '미완료', 'no']
  if (negative.some((word) => normalized.includes(word))) return false
  const positive = ['해제', '완료', '했', '네', '예']
  if (positive.some((word) => normalized.includes(word))) return true
  return null
}

// 매칭된 필드에 값을 할당 (필드별 타입 변환 포함)
function assignField(fields: SteamRegistrationFields, key: RegistrationFieldKey, rawValue: string): void {
  const value = rawValue.trim()
  switch (key) {
    case 'refundConsent':
      fields.refundConsent = isAffirmative(value)
      return
    case 'steamGuardDisabled':
      fields.steamGuardDisabled = parseGuardDisabled(value)
      return
    case 'steamId':
      if (value) fields.steamId = value
      return
    case 'steamPassword':
      if (value) fields.steamPassword = value
      return
    case 'gameName':
      if (value) fields.gameName = value
      return
    case 'buyerName':
      if (value) fields.buyerName = value
      return
    case 'steamGuardCodes':
      if (value) fields.steamGuardCodes = value
      return
  }
}

// 양식 종류 추정
function inferFormVariant(fields: SteamRegistrationFields, anyLabelMatched: boolean): string {
  if (fields.steamGuardCodes !== null) return 'A'
  if (fields.steamGuardDisabled !== null) return 'B'
  if (anyLabelMatched) return 'C'
  return 'unknown'
}

export function parseSteamRegistration(raw: string): SteamRegistrationParseResult {
  const fields: SteamRegistrationFields = {
    steamId: null,
    steamPassword: null,
    gameName: null,
    buyerName: null,
    steamGuardCodes: null,
    steamGuardDisabled: null,
    refundConsent: false,
  }

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  // 헤더·구분선 등을 제외한 실제 데이터 줄 수 — 양식 여부 판별에 사용
  const meaningfulLineCount = lines.filter((line) => !isNoiseLine(line)).length

  const labelLessValues: string[] = []
  let anyLabelMatched = false

  for (const line of lines) {
    if (isNoiseLine(line)) continue

    const { label, value } = splitLine(line)
    if (label !== null) {
      const fieldKey = matchFieldKey(normalize(label))
      if (fieldKey) {
        anyLabelMatched = true
        assignField(fields, fieldKey, value)
        continue
      }
    }
    const cleanedValue = stripLeadingMarker(value)
    if (cleanedValue.length > 0) labelLessValues.push(cleanedValue)
  }

  // 라벨 없는 값 → 아직 비어있는 필수 필드를 표준 순서로 채움
  let valueIndex = 0
  for (const key of POSITIONAL_ORDER) {
    if (valueIndex >= labelLessValues.length) break
    if (fields[key] !== null) continue
    assignField(fields, key, labelLessValues[valueIndex])
    valueIndex += 1
  }

  const formVariant = inferFormVariant(fields, anyLabelMatched)
  const missingFields = REQUIRED_FIELDS.filter((key) => fields[key] === null)
  // 라벨이 하나라도 매칭됐거나(라벨형 양식), 라벨 없이도 줄 수가 충분하면(번호형/위치형
  // 양식) 등록 양식으로 본다. 그 외 1~3줄 자유 텍스트는 일반 문의로 간주한다.
  const looksLikeRegistration = anyLabelMatched || meaningfulLineCount >= FORM_MIN_LINES

  return { fields, formVariant, missingFields, looksLikeRegistration }
}
