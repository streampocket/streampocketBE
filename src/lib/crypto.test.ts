import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { encryptSecret, decryptSecret } from './crypto'

/**
 * 파티 OTP 시크릿 암호화(AES-256-GCM) 왕복 테스트.
 * env OTP_SECRET_ENC_KEY를 테스트 안에서 주입/복원한다.
 */

const TEST_KEY = 'a'.repeat(64) // 64자 hex = 32바이트

let originalKey: string | undefined

beforeEach(() => {
  originalKey = process.env.OTP_SECRET_ENC_KEY
  process.env.OTP_SECRET_ENC_KEY = TEST_KEY
})

afterEach(() => {
  if (originalKey === undefined) {
    delete process.env.OTP_SECRET_ENC_KEY
  } else {
    process.env.OTP_SECRET_ENC_KEY = originalKey
  }
})

describe('encryptSecret / decryptSecret', () => {
  it('암호화 → 복호화 왕복 시 원문 보존', () => {
    const plain = 'JBSWY3DPEHPK3PXP'
    expect(decryptSecret(encryptSecret(plain))).toBe(plain)
  })

  it('암호문은 v1: 프리픽스 4파트 포맷이며 원문을 포함하지 않는다', () => {
    const plain = 'JBSWY3DPEHPK3PXP'
    const enc = encryptSecret(plain)
    expect(enc.startsWith('v1:')).toBe(true)
    expect(enc.split(':')).toHaveLength(4)
    expect(enc).not.toContain(plain)
  })

  it('같은 원문도 IV가 달라 매번 다른 암호문 (패턴 노출 방지)', () => {
    const plain = 'JBSWY3DPEHPK3PXP'
    expect(encryptSecret(plain)).not.toBe(encryptSecret(plain))
  })

  it('암호문 변조 시 복호화 실패 (GCM 인증 태그)', () => {
    const enc = encryptSecret('JBSWY3DPEHPK3PXP')
    const parts = enc.split(':')
    // ciphertext 마지막 파트를 뒤집어 변조
    const tampered = [...parts.slice(0, 3), Buffer.from('tampered!!').toString('base64')].join(':')
    expect(() => decryptSecret(tampered)).toThrow()
  })

  it('키 미설정 시 statusCode 500 에러', () => {
    delete process.env.OTP_SECRET_ENC_KEY
    expect(() => encryptSecret('JBSWY3DPEHPK3PXP')).toThrowError(
      expect.objectContaining({ statusCode: 500 }),
    )
  })

  it('키 형식 오류(길이 부족) 시 statusCode 500 에러', () => {
    process.env.OTP_SECRET_ENC_KEY = 'abc123'
    expect(() => encryptSecret('JBSWY3DPEHPK3PXP')).toThrowError(
      expect.objectContaining({ statusCode: 500 }),
    )
  })
})
