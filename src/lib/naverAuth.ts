import bcrypt from 'bcryptjs'
import { z } from 'zod'

type TokenCache = {
  accessToken: string
  expiresAt: number // Unix timestamp (ms)
}

type NaverErrorDetail = {
  name: string | null
  message: string | null
}

type ParsedNaverError = {
  code: string | null
  message: string | null
  timestamp: string | null
  invalidInputs: NaverErrorDetail[]
}

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().int().positive(),
})

// 메모리 캐시 (서버 재시작 시 초기화)
let tokenCache: TokenCache | null = null

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function validateBaseUrl(baseUrl: string): string {
  let parsedUrl: URL

  try {
    parsedUrl = new URL(baseUrl)
  } catch {
    throw new Error('NAVER_API_BASE_URL 환경변수가 올바른 URL 형식이 아닙니다.')
  }

  if (!/^\/external\/?$/.test(parsedUrl.pathname)) {
    throw new Error(
      'NAVER_API_BASE_URL 환경변수는 https://api.commerce.naver.com/external 형식이어야 합니다.',
    )
  }

  return baseUrl
}

function getCredentials() {
  const clientId = process.env['NAVER_CLIENT_ID']
  const clientSecret = process.env['NAVER_CLIENT_SECRET']
  const baseUrl = validateBaseUrl(
    process.env['NAVER_API_BASE_URL'] ?? 'https://api.commerce.naver.com/external',
  )
  if (!clientId || !clientSecret) {
    throw new Error('NAVER_CLIENT_ID, NAVER_CLIENT_SECRET 환경변수를 설정해 주세요.')
  }
  return { clientId, clientSecret, baseUrl }
}

// 네이버 규격에 맞춰 bcrypt 해시를 Base64로 인코딩한다.
async function generateSignature(
  clientId: string,
  clientSecret: string,
  timestamp: number,
): Promise<string> {
  const message = `${clientId}_${timestamp}`
  const hashedMessage = await bcrypt.hash(message, clientSecret)
  return Buffer.from(hashedMessage, 'utf8').toString('base64')
}

function parseNaverError(text: string): ParsedNaverError | null {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    return null
  }

  if (!isRecord(parsed)) return null

  const invalidInputsValue = parsed['invalidInputs']
  const invalidInputs = Array.isArray(invalidInputsValue)
    ? invalidInputsValue
        .map((input): NaverErrorDetail | null => {
          if (!isRecord(input)) return null
          return {
            name: readString(input['name']),
            message: readString(input['message']),
          }
        })
        .filter((input): input is NaverErrorDetail => input !== null)
    : []

  return {
    code: readString(parsed['code']),
    message: readString(parsed['message']),
    timestamp: readString(parsed['timestamp']),
    invalidInputs,
  }
}

function buildNaverTokenError(status: number, text: string): Error {
  const parsedError = parseNaverError(text)
  if (!parsedError) {
    return new Error(`네이버 토큰 발급 실패 (${status}): ${text}`)
  }

  const details = [
    parsedError.code ? `code=${parsedError.code}` : null,
    parsedError.message ? `message=${parsedError.message}` : null,
    parsedError.timestamp ? `timestamp=${parsedError.timestamp}` : null,
    parsedError.invalidInputs.length > 0
      ? `invalidInputs=${parsedError.invalidInputs
          .map((input) => [input.name, input.message].filter(Boolean).join(':'))
          .join(', ')}`
      : null,
  ].filter((value): value is string => value !== null)

  return new Error(`네이버 토큰 발급 실패 (${status})${details.length > 0 ? `: ${details.join(' | ')}` : ''}`)
}

async function fetchAccessToken(): Promise<TokenCache> {
  const { clientId, clientSecret, baseUrl } = getCredentials()
  const timestamp = Date.now()
  const signature = await generateSignature(clientId, clientSecret, timestamp)

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
    throw buildNaverTokenError(res.status, text)
  }

  const data = tokenResponseSchema.parse(await res.json())
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
