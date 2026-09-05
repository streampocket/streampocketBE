import { describe, expect, it } from 'vitest'
import { findBlockingReason, type AssignGuardInput } from './dramaAssignmentService'

// 배정을 시작하기 전에 걸러야 하는 조건들.
// DB를 타지 않는 판단 규칙이라 순수 함수로 노출해 그대로 검증한다.

const application = (over: Partial<AssignGuardInput> = {}): AssignGuardInput => ({
  status: 'confirmed',
  expiresAt: new Date('2026-09-11T01:30:00.000Z'),
  dramaAccountId: null,
  otpCredential: null,
  product: { name: '비글루' },
  ...over,
})

describe('자동 배정 사전 가드', () => {
  it('모든 조건이 맞으면 막지 않는다', () => {
    expect(findBlockingReason(application())).toBeNull()
  })

  it('신청이 없으면 not_found', () => {
    expect(findBlockingReason(null)).toBe('not_found')
  })

  it('승인 전(pending) 신청은 배정하지 않는다', () => {
    expect(findBlockingReason(application({ status: 'pending' }))).toBe('not_confirmed')
  })

  it('취소된 신청은 배정하지 않는다', () => {
    expect(findBlockingReason(application({ status: 'cancelled' }))).toBe('not_confirmed')
  })

  // 만료 시각이 없으면 파티원 endDate·계정 마감일 비교를 할 수 없다
  it('만료 시각이 없으면 배정하지 않는다', () => {
    expect(findBlockingReason(application({ expiresAt: null }))).toBe('not_confirmed')
  })

  // 멱등 — 재시도를 두 번 눌러도 계정 자리를 두 번 먹지 않는다
  it('이미 계정이 배정된 신청은 already_assigned', () => {
    expect(findBlockingReason(application({ dramaAccountId: 'acc-1' }))).toBe('already_assigned')
  })

  // 관리자가 수동으로 시크릿만 등록해둔 건은 dramaAccountId가 비어 "미배정"으로 보인다.
  // 이 가드가 없으면 자동 배정이 그 시크릿을 덮어쓰고 계정 자리까지 하나 더 먹는다.
  it('수동으로 OTP 시크릿만 등록된 신청은 already_has_secret으로 막는다', () => {
    expect(findBlockingReason(application({ otpCredential: { id: 'cred-1' } }))).toBe(
      'already_has_secret',
    )
  })

  it('매핑에 없는 파티명은 unmapped_party', () => {
    expect(findBlockingReason(application({ product: { name: '없는파티' } }))).toBe('unmapped_party')
  })

  // 가드 순서가 뒤집히면 "이미 배정된 건"에 시크릿 없음 사유가 뜨는 식으로 문구가 어긋난다
  it('배정 여부를 시크릿 존재보다 먼저 본다', () => {
    const both = application({ dramaAccountId: 'acc-1', otpCredential: { id: 'cred-1' } })
    expect(findBlockingReason(both)).toBe('already_assigned')
  })
})
