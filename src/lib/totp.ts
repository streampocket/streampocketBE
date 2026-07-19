import * as OTPAuth from 'otpauth'

// TOTP 코드 생성 — fe/lib/totp.ts(관리자 OTP 발급 도구)와 동일 규격.
// Google Authenticator 기본값: SHA1 · 6자리 · 30초

export const TOTP_PERIOD = 30

// 시크릿 정규화: 공백 제거 + 대문자 (Google이 4자리씩 띄워 보여주는 경우 대비)
export function normalizeSecret(input: string): string {
  return input.replace(/\s+/g, '').toUpperCase()
}

// Base32 유효성 검증 (fromBase32는 잘못된 형식이면 throw)
export function isValidSecret(input: string): boolean {
  try {
    OTPAuth.Secret.fromBase32(normalizeSecret(input))
    return true
  } catch {
    return false
  }
}

function buildTotp(input: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(normalizeSecret(input)),
    digits: 6,
    period: TOTP_PERIOD,
  })
}

// 현재 6자리 TOTP 코드 생성 (절대 시각 epoch 기준이라 타임존 무관)
export function generateCode(input: string): string {
  return buildTotp(input).generate()
}

// 창 전환 임계(초) — 현재 창의 남은 시간이 이 값 미만이면 다음 창 코드를 발급
const WINDOW_SWITCH_THRESHOLD_SECONDS = 15

// 발급용 코드 선택 — 클릭 시점 기준 "앞으로 30초"를 가장 넓게 커버하는 창의 코드를 반환.
// TOTP는 절대시각 30초 창 단위라 클릭 시점부터 정확히 30초 유효한 코드는 존재하지 않음 →
// 남은 시간이 충분하면 현재 창, 임박했으면 다음 창 코드를 골라 체감 유효시간을 최대화한다
export function generateIssueCode(input: string): string {
  const totp = buildTotp(input)
  if (getRemainingSeconds() >= WINDOW_SWITCH_THRESHOLD_SECONDS) {
    return totp.generate()
  }
  return totp.generate({ timestamp: Date.now() + TOTP_PERIOD * 1000 })
}

// 현재 주기에서 남은 초 (30 → 1)
export function getRemainingSeconds(): number {
  return TOTP_PERIOD - (Math.floor(Date.now() / 1000) % TOTP_PERIOD)
}
