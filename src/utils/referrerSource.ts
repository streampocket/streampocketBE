// 방문 유입 경로 분류 — referrer/utm_source 원본을 받아 분류값과 host를 반환하는 순수 함수.
// 분류값은 enum이 아닌 문자열(규칙 진화 대비). FE 라벨 매핑은 fe 관리자 페이지 _types에 있다.

export type ClassifiedSource = {
  source: string
  referrerHost: string | null
}

// utm_source 별칭 → 분류값 (소문자 정규화 후 매칭)
const UTM_ALIASES: Record<string, string> = {
  google: 'google',
  naver: 'naver_search',
  naverblog: 'naver_blog',
  naver_blog: 'naver_blog',
  navercafe: 'naver_cafe',
  naver_cafe: 'naver_cafe',
  threads: 'threads',
  instagram: 'instagram',
  ig: 'instagram',
  youtube: 'youtube',
  tistory: 'tistory',
  daum: 'daum',
  kakao: 'kakao',
  facebook: 'facebook',
  fb: 'facebook',
  x: 'x',
  twitter: 'x',
}

// 자기 사이트 — 내부 이동 referrer는 직접 유입으로 처리 (오염 방지)
const SELF_HOSTS = ['pubgcode.kr', 'ottall.com', 'localhost', '127.0.0.1']

// 호스트 규칙 — 순서 중요: naver 세분류가 naver 포괄(naver_other)보다 먼저 와야 한다
const HOST_RULES: { source: string; domains: string[] }[] = [
  { source: 'naver_blog', domains: ['blog.naver.com', 'm.blog.naver.com'] },
  { source: 'naver_cafe', domains: ['cafe.naver.com', 'm.cafe.naver.com'] },
  { source: 'naver_search', domains: ['search.naver.com', 'm.search.naver.com'] },
  { source: 'naver_other', domains: ['naver.com'] },
  { source: 'daum', domains: ['daum.net'] },
  { source: 'kakao', domains: ['kakao.com', 'kakaotalk.com'] },
  { source: 'threads', domains: ['threads.net', 'threads.com'] },
  { source: 'instagram', domains: ['instagram.com'] },
  { source: 'youtube', domains: ['youtube.com', 'youtu.be'] },
  { source: 'tistory', domains: ['tistory.com'] },
  { source: 'x', domains: ['x.com', 'twitter.com', 't.co'] },
  { source: 'facebook', domains: ['facebook.com'] },
  { source: 'bing', domains: ['bing.com'] },
]

// host === domain 또는 host가 .domain으로 끝나는 서브도메인 (evil.com 뒤에 붙인 위장 도메인 방지)
function matchesDomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`)
}

function parseHost(referrer: string): string | null {
  try {
    return new URL(referrer).hostname.toLowerCase()
  } catch {
    return null
  }
}

export function classifyReferrer(input: {
  referrer: string | null
  utmSource: string | null
}): ClassifiedSource {
  const referrerHost = input.referrer ? parseHost(input.referrer) : null

  // 1. utm_source 우선 — 홍보 링크에 붙인 값은 referrer보다 신뢰도가 높다
  const utm = input.utmSource?.trim().toLowerCase()
  if (utm) {
    const aliased = UTM_ALIASES[utm]
    // 미지의 utm 값은 'utm:' 접두로 원본 보존 (source 컬럼 30자 제한에 맞춰 절단)
    return { source: aliased ?? `utm:${utm}`.slice(0, 30), referrerHost }
  }

  // 2. referrer 없음/파싱 실패 → 직접 유입
  if (!referrerHost) {
    return { source: 'direct', referrerHost: null }
  }

  // 3. 자기 사이트 내부 이동 → 직접 유입
  if (SELF_HOSTS.some((d) => matchesDomain(referrerHost, d))) {
    return { source: 'direct', referrerHost: null }
  }

  // 4. 호스트 규칙 매칭 — 구글은 국가별 도메인(google.com/co.kr 등)이 많아 별도 처리
  if (referrerHost === 'google.com' || referrerHost.includes('.google.')  || referrerHost.startsWith('google.')) {
    return { source: 'google', referrerHost }
  }
  for (const rule of HOST_RULES) {
    if (rule.domains.some((d) => matchesDomain(referrerHost, d))) {
      return { source: rule.source, referrerHost }
    }
  }

  // 5. 미분류 — host 보존해 관리자 화면 '기타' 상세로 표시
  return { source: 'other', referrerHost }
}
