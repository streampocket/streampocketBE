type GoogleTokenResponse = {
  access_token: string
  id_token: string
  expires_in: number
  token_type: string
}

type GoogleUserInfo = {
  googleId: string
  email: string | null
  name: string | null
}

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('구글 OAuth 환경변수가 설정되지 않았습니다.')
  }

  return { clientId, clientSecret, redirectUri }
}

export function getGoogleAuthUrl(): string {
  const { clientId, redirectUri } = getGoogleConfig()
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

function decodeIdTokenPayload(idToken: string): Record<string, unknown> {
  const parts = idToken.split('.')
  if (parts.length !== 3) throw new Error('잘못된 id_token 형식')

  const payload = parts[1]
  if (!payload) throw new Error('id_token payload가 없습니다.')

  const decoded = Buffer.from(payload, 'base64url').toString('utf-8')
  return JSON.parse(decoded) as Record<string, unknown>
}

export async function getGoogleUserInfo(code: string): Promise<GoogleUserInfo> {
  const { clientId, clientSecret, redirectUri } = getGoogleConfig()

  // code -> tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }).toString(),
  })

  if (!tokenRes.ok) {
    const errorBody = await tokenRes.text()
    throw new Error(`구글 토큰 발급 실패: ${errorBody}`)
  }

  const tokenData = (await tokenRes.json()) as GoogleTokenResponse

  // id_token 디코딩
  const payload = decodeIdTokenPayload(tokenData.id_token)

  return {
    googleId: typeof payload.sub === 'string' ? payload.sub : '',
    email: typeof payload.email === 'string' ? payload.email : null,
    name: typeof payload.name === 'string' ? payload.name : null,
  }
}
