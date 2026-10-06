import { describe, expect, it } from 'vitest'
import { REVIEW_CONTENT_MIN_LENGTH, countReviewContentChars } from './reviewContent'

/**
 * 리뷰 본문 글자 수 규칙 고정 테스트.
 * 공백(띄어쓰기·줄바꿈·탭)은 세지 않고, 한글·이모지는 1자로 센다.
 */

describe('countReviewContentChars', () => {
  it('한글 완성형은 1자씩', () => {
    expect(countReviewContentChars('좋아요')).toBe(3)
    expect(countReviewContentChars('정말 좋아요')).toBe(5)
  })

  it('띄어쓰기·줄바꿈·탭은 세지 않는다', () => {
    expect(countReviewContentChars('좋 아 요')).toBe(3)
    expect(countReviewContentChars('  좋\n아\t요  ')).toBe(3)
    expect(countReviewContentChars('     ')).toBe(0)
  })

  it('이모지는 1자로 센다 (UTF-16 2자로 세지 않음)', () => {
    expect(countReviewContentChars('👍👍👍')).toBe(3)
    expect(countReviewContentChars('좋아요👍👍')).toBe(5)
  })
})

describe('최소 글자 수 경계', () => {
  it('최소 기준은 5자', () => {
    expect(REVIEW_CONTENT_MIN_LENGTH).toBe(5)
  })

  it('공백 제외 4자는 미달, 5자는 통과', () => {
    expect(countReviewContentChars('좋 아 요 오')).toBeLessThan(REVIEW_CONTENT_MIN_LENGTH)
    expect(countReviewContentChars('좋 아 요 오 예')).toBeGreaterThanOrEqual(REVIEW_CONTENT_MIN_LENGTH)
  })
})
