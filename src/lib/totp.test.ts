import { afterEach, describe, expect, it, vi } from 'vitest'
import { normalizeSecret, isValidSecret, generateCode, generateIssueCode, getRemainingSeconds, TOTP_PERIOD } from './totp'

/**
 * 파티 OTP — TOTP 유틸 규격 고정 테스트.
 * fe/lib/totp.ts(관리자 OTP 발급 도구)와 동일 규격(SHA1 · 6자리 · 30초)이어야
 * 구매자 화면·관리자 도구·Google Authenticator가 같은 코드를 만든다.
 */

const VALID_SECRET = 'JBSWY3DPEHPK3PXP' // Base32 예시 시크릿

describe('normalizeSecret', () => {
  it('공백 제거 + 대문자 변환 (Google 4자리 띄어쓰기 표기 대응)', () => {
    expect(normalizeSecret('jbsw y3dp ehpk 3pxp')).toBe('JBSWY3DPEHPK3PXP')
  })

  it('탭·줄바꿈도 제거', () => {
    expect(normalizeSecret('JBSW\tY3DP\nEHPK 3PXP')).toBe('JBSWY3DPEHPK3PXP')
  })
})

describe('isValidSecret', () => {
  it('유효한 Base32 시크릿 → true', () => {
    expect(isValidSecret(VALID_SECRET)).toBe(true)
  })

  it('공백 섞인 소문자 시크릿도 정규화 후 유효', () => {
    expect(isValidSecret('jbsw y3dp ehpk 3pxp')).toBe(true)
  })

  it('Base32가 아닌 문자(1, 8, 9, 0 등) 포함 → false', () => {
    expect(isValidSecret('INVALID1890!!')).toBe(false)
  })
})

describe('generateCode', () => {
  it('6자리 숫자 코드를 생성한다', () => {
    expect(generateCode(VALID_SECRET)).toMatch(/^\d{6}$/)
  })

  it('같은 시각(30초 주기 내)에는 정규화 여부와 무관하게 같은 코드', () => {
    expect(generateCode('jbsw y3dp ehpk 3pxp')).toBe(generateCode(VALID_SECRET))
  })
})

describe('getRemainingSeconds', () => {
  it('1 이상 TOTP_PERIOD(30) 이하', () => {
    const remaining = getRemainingSeconds()
    expect(remaining).toBeGreaterThanOrEqual(1)
    expect(remaining).toBeLessThanOrEqual(TOTP_PERIOD)
  })
})

describe('generateIssueCode — 발급용 코드 창 선택', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  // 30초 창 경계에 맞춘 기준 시각 (epoch가 30의 배수인 초)
  const WINDOW_START = 1_784_500_020_000 // 초 단위 1784500020 % 30 === 0

  it('창 초반(남은 30초) → 현재 창 코드', () => {
    vi.useFakeTimers()
    vi.setSystemTime(WINDOW_START)
    expect(generateIssueCode(VALID_SECRET)).toBe(generateCode(VALID_SECRET))
  })

  it('창 끝자락(남은 3초) → 다음 창 코드', () => {
    vi.useFakeTimers()
    vi.setSystemTime(WINDOW_START + 27_000)
    const issued = generateIssueCode(VALID_SECRET)
    const current = generateCode(VALID_SECRET)
    vi.setSystemTime(WINDOW_START + 30_000) // 다음 창 진입
    const nextWindow = generateCode(VALID_SECRET)
    expect(issued).not.toBe(current)
    expect(issued).toBe(nextWindow)
  })

  it('임계 경계(남은 15초) → 현재 창 코드', () => {
    vi.useFakeTimers()
    vi.setSystemTime(WINDOW_START + 15_000)
    expect(generateIssueCode(VALID_SECRET)).toBe(generateCode(VALID_SECRET))
  })
})
