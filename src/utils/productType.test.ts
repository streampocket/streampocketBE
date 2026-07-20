import { describe, expect, it } from 'vitest'
import { detectProductType } from './productType'

/**
 * 상품 타입 판별 규칙 고정 테스트.
 * 우선순위: BG > 접미사 ' NA' > 접미사 ' AA' > 이름 내 단어 NA > 이름 내 단어 AA
 */

describe('detectProductType', () => {
  it('접미사 NA — 기존 규칙 유지', () => {
    expect(detectProductType('발더스 게이트 3 NA')).toBe('NA')
    expect(detectProductType('발더스 게이트 3 na')).toBe('NA')
  })

  it('접미사 AA — 기존 규칙 유지', () => {
    expect(detectProductType('엘든 링 AA')).toBe('AA')
  })

  it('배틀그라운드 포함 시 BG (NA보다 우선)', () => {
    expect(detectProductType('배틀그라운드 NA')).toBe('BG')
    expect(detectProductType('배틀그라운드 지코인')).toBe('BG')
  })

  it('완화: 괄호 표기 NA 인식', () => {
    expect(detectProductType('발더스 게이트 3 (NA)')).toBe('NA')
    expect(detectProductType('발더스 게이트 3(NA)')).toBe('NA')
  })

  it('완화: 한글에 붙은 NA 인식 (한글은 \\w가 아니라 단어 경계 성립)', () => {
    expect(detectProductType('게임명NA')).toBe('NA')
  })

  it('완화: 이름 중간·앞의 NA 인식', () => {
    expect(detectProductType('NA 발더스 게이트 3')).toBe('NA')
    expect(detectProductType('발더스 NA 한국어판')).toBe('NA')
  })

  it('NA·AA 동시 포함 시 NA 우선 (단, 접미사 AA는 기존 규칙대로 AA)', () => {
    expect(detectProductType('NA AA 게임')).toBe('NA')
    expect(detectProductType('NA 게임 AA')).toBe('AA')
  })

  it('오탐 방지: 영단어 내부의 na/aa는 미인식', () => {
    expect(detectProductType('DNA Simulator')).toBe(null)
    expect(detectProductType('Sonata of Winter')).toBe(null)
    expect(detectProductType('Isaac Rebirth')).toBe(null)
  })

  it('타입 표기 없는 이름은 null', () => {
    expect(detectProductType('엘든 링 디럭스 에디션')).toBe(null)
  })
})
