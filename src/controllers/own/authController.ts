import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import {
  signup,
  login,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} from '../../services/own/userAuthService'
import { sendCode, verifyCode, isPhoneVerified } from '../../services/own/phoneVerificationService'
import { getKakaoAuthUrl, getKakaoUserInfo } from '../../services/own/kakaoOAuthService'
import { getGoogleAuthUrl, getGoogleUserInfo } from '../../services/own/googleOAuthService'
import {
  findUserByProvider,
  findUserByEmail,
  createUser,
  updateUserPhone,
} from '../../repositories/own/userRepository'

const passwordSchema = z
  .string()
  .min(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  .refine(
    (val) => {
      const hasLetter = /[a-zA-Z]/.test(val)
      const hasNumber = /\d/.test(val)
      const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(val)
      const categories = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length
      return categories >= 2
    },
    { message: '영문, 숫자, 특수문자 중 2가지 이상 조합해주세요.' },
  )

const signupSchema = z.object({
  name: z
    .string()
    .min(2, { message: '이름은 2자 이상이어야 합니다.' })
    .max(20, { message: '이름은 20자 이하여야 합니다.' })
    .refine((val) => val.trim().length > 0, { message: '이름을 입력해주세요.' }),
  email: z.string().email({ message: '올바른 이메일 형식이 아닙니다.' }).max(320),
  password: passwordSchema,
  phone: z.string().regex(/^010\d{8}$/, { message: '올바른 휴대폰 번호를 입력해주세요.' }),
  verificationId: z.string().uuid(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const phoneSendSchema = z.object({
  phone: z.string().regex(/^010\d{8}$/, { message: '올바른 휴대폰 번호를 입력해주세요.' }),
})

const phoneVerifySchema = z.object({
  phone: z.string().regex(/^010\d{8}$/),
  code: z.string().length(6),
})

export async function signupHandler(req: Request, res: Response): Promise<void> {
  const body = signupSchema.parse(req.body)
  const result = await signup(body)

  const refreshToken = signRefreshToken({ id: result.user.id, email: result.user.email })
  setRefreshCookie(res, refreshToken)

  res.status(201).json({ data: result })
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const body = loginSchema.parse(req.body)
  const result = await login(body)

  const refreshToken = signRefreshToken({ id: result.user.id, email: result.user.email })
  setRefreshCookie(res, refreshToken)

  res.json({ data: result })
}

export async function phoneSendHandler(req: Request, res: Response): Promise<void> {
  const body = phoneSendSchema.parse(req.body)
  const result = await sendCode(body.phone)
  res.json({ data: result })
}

export async function phoneVerifyHandler(req: Request, res: Response): Promise<void> {
  const body = phoneVerifySchema.parse(req.body)
  const result = await verifyCode(body.phone, body.code)
  res.json({ data: result })
}

// ───────────────────────── 토큰 갱신 / 로그아웃 ─────────────────────────

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken
  if (!token) {
    res.status(401).json({ message: '리프레시 토큰이 없습니다.' })
    return
  }

  try {
    const payload = verifyRefreshToken(token)
    const accessToken = signAccessToken({ id: payload.id, email: payload.email })
    res.json({ data: { token: accessToken } })
  } catch {
    clearRefreshCookie(res)
    res.status(401).json({ message: '리프레시 토큰이 만료되었습니다.' })
  }
}

export async function logoutHandler(_req: Request, res: Response): Promise<void> {
  clearRefreshCookie(res)
  res.json({ message: '로그아웃 되었습니다.' })
}

// ───────────────────────── 소셜 로그인 ─────────────────────────

const feOrigin = process.env.FE_ORIGIN ?? 'http://localhost:3000'

type TempJwtPayload = {
  id: string
  email: string
  temp: boolean
}

async function handleSocialCallback(
  provider: 'kakao' | 'google',
  providerId: string,
  email: string | null,
  name: string | null,
  res: Response,
): Promise<void> {
  if (!email) {
    res.redirect(`${feOrigin}/signin?error=email_required`)
    return
  }

  // 기존 소셜 유저 조회
  let user = await findUserByProvider(provider, providerId)

  if (user && user.phoneVerified) {
    // 이미 가입 완료된 유저 → 정식 JWT + Refresh Cookie
    const token = signAccessToken({ id: user.id, email: user.email })
    const refreshToken = signRefreshToken({ id: user.id, email: user.email })
    setRefreshCookie(res, refreshToken)
    res.redirect(`${feOrigin}/auth/social/callback?token=${token}`)
    return
  }

  if (!user) {
    // 동일 이메일로 가입된 계정 확인
    const existingByEmail = await findUserByEmail(email)
    if (existingByEmail) {
      res.redirect(`${feOrigin}/signin?error=email_exists`)
      return
    }

    // 신규 소셜 유저 생성 (phone 임시값, phoneVerified=false)
    user = await createUser({
      email,
      name: name ?? '사용자',
      phone: `temp_${Date.now()}`,
      phoneVerified: false,
      provider,
      providerId,
    })
  }

  // 전화인증 미완료 → 임시 JWT (Refresh Token 발급 안 함)
  const tempToken = signAccessToken({ id: user.id, email: user.email, temp: true })
  res.redirect(`${feOrigin}/auth/social/phone?tempToken=${tempToken}`)
}

export async function kakaoRedirectHandler(_req: Request, res: Response): Promise<void> {
  const url = getKakaoAuthUrl()
  res.redirect(url)
}

export async function kakaoCallbackHandler(req: Request, res: Response): Promise<void> {
  const code = req.query.code
  if (typeof code !== 'string') {
    res.redirect(`${feOrigin}/signin?error=kakao_failed`)
    return
  }

  try {
    const info = await getKakaoUserInfo(code)
    await handleSocialCallback('kakao', info.kakaoId, info.email, info.nickname, res)
  } catch (err) {
    console.error('[KAKAO] OAuth callback error:', err)
    res.redirect(`${feOrigin}/signin?error=kakao_failed`)
  }
}

export async function googleRedirectHandler(_req: Request, res: Response): Promise<void> {
  const url = getGoogleAuthUrl()
  res.redirect(url)
}

export async function googleCallbackHandler(req: Request, res: Response): Promise<void> {
  const code = req.query.code
  if (typeof code !== 'string') {
    res.redirect(`${feOrigin}/signin?error=google_failed`)
    return
  }

  try {
    const info = await getGoogleUserInfo(code)
    await handleSocialCallback('google', info.googleId, info.email, info.name, res)
  } catch (err) {
    console.error('[GOOGLE] OAuth callback error:', err)
    res.redirect(`${feOrigin}/signin?error=google_failed`)
  }
}

// ───────────────────────── 소셜 가입 전화번호 보충 ─────────────────────────

const socialCompleteSchema = z.object({
  tempToken: z.string(),
  phone: z.string().regex(/^010\d{8}$/),
  verificationId: z.string().uuid(),
})

export async function socialCompleteHandler(req: Request, res: Response): Promise<void> {
  const body = socialCompleteSchema.parse(req.body)

  const secret = process.env.JWT_USER_SECRET
  if (!secret) {
    res.status(500).json({ message: '서버 설정 오류' })
    return
  }

  // 단언 사유: jwt.verify는 string | JwtPayload를 반환하나, sign 시 객체로 전달하므로 객체 보장
  const payload = jwt.verify(body.tempToken, secret) as TempJwtPayload
  if (!payload.temp) {
    res.status(400).json({ message: '잘못된 토큰입니다.' })
    return
  }

  const phoneOk = await isPhoneVerified(body.verificationId, body.phone)
  if (!phoneOk) {
    res.status(400).json({ message: '전화번호 인증이 완료되지 않았습니다.' })
    return
  }

  await updateUserPhone({
    id: payload.id,
    phone: body.phone,
    phoneVerified: true,
  })

  const token = signAccessToken({ id: payload.id, email: payload.email })
  const refreshToken = signRefreshToken({ id: payload.id, email: payload.email })
  setRefreshCookie(res, refreshToken)

  res.json({
    data: {
      token,
      user: { id: payload.id, email: payload.email },
    },
  })
}
