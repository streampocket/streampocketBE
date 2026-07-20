import { describe, expect, it } from 'vitest'
import { classifyReferrer } from './referrerSource'

/** 방문 유입 분류 규칙 고정 테스트 */

function classify(referrer: string | null, utmSource: string | null = null) {
  return classifyReferrer({ referrer, utmSource })
}

describe('classifyReferrer — 호스트 규칙', () => {
  it('네이버 블로그 (PC·모바일)', () => {
    expect(classify('https://blog.naver.com/someone/223123').source).toBe('naver_blog')
    expect(classify('https://m.blog.naver.com/someone/223123').source).toBe('naver_blog')
  })

  it('네이버 검색 (쿼리 포함)', () => {
    expect(classify('https://search.naver.com/search.naver?query=배그+지코인').source).toBe(
      'naver_search',
    )
  })

  it('네이버 카페 / 네이버 기타', () => {
    expect(classify('https://cafe.naver.com/somecafe').source).toBe('naver_cafe')
    expect(classify('https://shopping.naver.com/x').source).toBe('naver_other')
  })

  it('구글 (국가 도메인 포함)', () => {
    expect(classify('https://www.google.com/').source).toBe('google')
    expect(classify('https://www.google.co.kr/search?q=x').source).toBe('google')
  })

  it('스레드·인스타그램(링크 래퍼 포함)·유튜브·티스토리', () => {
    expect(classify('https://www.threads.net/@user/post/1').source).toBe('threads')
    expect(classify('https://l.instagram.com/?u=https%3A%2F%2Fpubgcode.kr').source).toBe(
      'instagram',
    )
    expect(classify('https://youtu.be/abc123').source).toBe('youtube')
    expect(classify('https://mygame.tistory.com/12').source).toBe('tistory')
  })

  it('X(트위터 단축 포함)·카카오', () => {
    expect(classify('https://t.co/abc').source).toBe('x')
    expect(classify('https://pf.kakao.com/_lULGX').source).toBe('kakao')
  })

  it('대문자 URL도 정규화되어 매칭', () => {
    expect(classify('HTTPS://BLOG.NAVER.COM/X').source).toBe('naver_blog')
  })
})

describe('classifyReferrer — 직접 유입', () => {
  it('referrer null/빈 문자열/URL 아님 → direct', () => {
    expect(classify(null)).toEqual({ source: 'direct', referrerHost: null })
    expect(classify('').source).toBe('direct')
    expect(classify('not-a-url').source).toBe('direct')
  })

  it('자기 사이트 내부 이동 → direct', () => {
    expect(classify('https://pubgcode.kr/products/1').source).toBe('direct')
    expect(classify('https://www.ottall.com/party').source).toBe('direct')
    expect(classify('http://localhost:3001/').source).toBe('direct')
  })
})

describe('classifyReferrer — 기타/경계', () => {
  it('미분류 host는 other + host 보존', () => {
    expect(classify('https://some-blog.example.com/post/1')).toEqual({
      source: 'other',
      referrerHost: 'some-blog.example.com',
    })
  })

  it('위장 도메인은 매칭 안 됨 (endsWith 경계)', () => {
    expect(classify('https://fakeblog.naver.com.evil.com/x').source).toBe('other')
  })
})

describe('classifyReferrer — utm_source 우선', () => {
  it('utm이 있으면 referrer보다 우선', () => {
    expect(classify('https://www.google.com/', 'naver_blog').source).toBe('naver_blog')
  })

  it('별칭 매핑 (대소문자 무시)', () => {
    expect(classify(null, 'IG').source).toBe('instagram')
    expect(classify(null, 'twitter').source).toBe('x')
  })

  it('미지의 utm 값은 utm: 접두로 보존', () => {
    expect(classify(null, 'partner_a').source).toBe('utm:partner_a')
  })

  it('utm이 있어도 referrerHost는 보존', () => {
    expect(classify('https://blog.naver.com/x', 'partner_a').referrerHost).toBe('blog.naver.com')
  })
})
