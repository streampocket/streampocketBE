import crypto from 'crypto'

type TokenCache = {
  accessToken: string
  expiresAt: number // Unix timestamp (ms)
}

// 메모리 캐시 (서버 재시작 시 초기화)
let tokenCache: TokenCache | null = null

function getCredentials() {
  const clientId = process.env['NAVER_CLIENT_ID']
  const clientSecret = process.env['NAVER_CLIENT_SECRET']
  const baseUrl = process.env['NAVER_API_BASE_URL'] ?? 'https://api.commerce.naver.com/external'
  if (!clientId || !clientSecret) {
    throw new Error('NAVER_CLIENT_ID, NAVER_CLIENT_SECRET 환경변수를 설정해 주세요.')
  }
  return { clientId, clientSecret, baseUrl }
}

// HMAC-SHA256 서명 생성 (네이버 Commerce API 인증 방식)
function generateSignature(clientId: string, clientSecret: string, timestamp: number): string {
  const message = `${clientId}_${timestamp}`
  return crypto.createHmac('sha256', clientSecret).update(message).digest('base64')
}

async function fetchAccessToken(): Promise<TokenCache> {
  const { clientId, clientSecret, baseUrl } = getCredentials()
  const timestamp = Date.now()
  const signature = generateSignature(clientId, clientSecret, timestamp)

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      timestamp: String(timestamp),
      client_secret_sign: signature,
      grant_type: 'client_credentials',
      type: 'SELF',
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`네이버 토큰 발급 실패 (${res.status}): ${text}`)
  }

  type TokenResponse = {
    access_token: string
    expires_in: number // 초 단위
  }
  const data = (await res.json()) as TokenResponse
  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 60_000, // 1분 여유
  }
}

// 유효한 액세스 토큰 반환 (만료 시 자동 재발급)
export async function getNaverAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.accessToken
  }
  tokenCache = await fetchAccessToken()
  return tokenCache.accessToken
}

// 네이버 API 공통 요청 헬퍼
export async function naverApiRequest(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const { baseUrl } = getCredentials()
  const token = await getNaverAccessToken()
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
}
