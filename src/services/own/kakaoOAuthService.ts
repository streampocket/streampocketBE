type KakaoTokenResponse = {
  access_token: string
  token_type: string
  refresh_token: string
  expires_in: number
}

type KakaoUserResponse = {
  id: number
  kakao_account?: {
    email?: string
    profile?: {
      nickname?: string
    }
  }
}

type KakaoUserInfo = {
  kakaoId: string
  email: string | null
  nickname: string | null
}

function getKakaoConfig() {
  const clientId = process.env.KAKAO_CLIENT_ID
  const clientSecret = process.env.KAKAO_CLIENT_SECRET
  const redirectUri = process.env.KAKAO_REDIRECT_URI

  if (!clientId || !redirectUri) {
    throw new Error('카카오 OAuth 환경변수가 설정되지 않았습니다.')
  }

  return { clientId, clientSecret, redirectUri }
}

export function getKakaoAuthUrl(): string {
  const { clientId, redirectUri } = getKakaoConfig()
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'profile_nickname,account_email',
  })
  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`
}

export async function getKakaoUserInfo(code: string): Promise<KakaoUserInfo> {
  const { clientId, clientSecret, redirectUri } = getKakaoConfig()

  // code -> access_token
  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
  })
  if (clientSecret) {
    tokenParams.set('client_secret', clientSecret)
  }

  const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams.toString(),
  })

  if (!tokenRes.ok) {
    const errorBody = await tokenRes.text()
    throw new Error(`카카오 토큰 발급 실패: ${errorBody}`)
  }

  const tokenData = (await tokenRes.json()) as KakaoTokenResponse

  // access_token -> user info
  const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  if (!userRes.ok) {
    throw new Error('카카오 사용자 정보 조회 실패')
  }

  const userData = (await userRes.json()) as KakaoUserResponse

  return {
    kakaoId: String(userData.id),
    email: userData.kakao_account?.email ?? null,
    nickname: userData.kakao_account?.profile?.nickname ?? null,
  }
}
