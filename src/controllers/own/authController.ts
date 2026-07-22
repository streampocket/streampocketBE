import { Request, Response } from 'express'
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
import {
  resolveSocialLogin,
  completeSocialSignup,
} from '../../services/own/socialAuthService'
import { sendCode, verifyCode } from '../../services/own/phoneVerificationService'
import { getKakaoAuthUrl, getKakaoUserInfo } from '../../services/own/kakaoOAuthService'
import { getGoogleAuthUrl, getGoogleUserInfo } from '../../services/own/googleOAuthService'
import { findUserById } from '../../repositories/own/userRepository'

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
  termsAgreed: z.literal(true, { message: '약관에 동의해주세요.' }),
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
    // 탈퇴(소프트 삭제)·완전 삭제된 계정은 refresh 재발급 차단 — 잔여 refresh cookie(7일)로 갱신되는 것 방지
    const user = await findUserById(payload.id)
    if (!user || user.deletedAt) {
      clearRefreshCookie(res)
      res.status(401).json({ message: '탈퇴 처리된 계정입니다.' })
      return
    }
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

const feOrigin = (process.env.FE_ORIGIN ?? 'http://localhost:3000').split(',')[0].trim()

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

  // 연동 링크 매칭 → 로그인 / 미연동 → 전화인증 단계 (User 선생성 없음 — 유령 계정 방지)
  const result = await resolveSocialLogin(provider, providerId, email, name)

  if (result.kind === 'login') {
    setRefreshCookie(res, result.refreshToken)
    res.redirect(`${feOrigin}/auth/social/callback?token=${result.token}`)
    return
  }

  res.redirect(`${feOrigin}/auth/social/phone?tempToken=${result.tempToken}`)
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
  termsAgreed: z.literal(true, { message: '약관에 동의해주세요.' }),
})

export async function socialCompleteHandler(req: Request, res: Response): Promise<void> {
  const body = socialCompleteSchema.parse(req.body)

  const result = await completeSocialSignup({
    tempToken: body.tempToken,
    phone: body.phone,
    verificationId: body.verificationId,
  })

  setRefreshCookie(res, result.refreshToken)

  res.json({
    data: {
      token: result.token,
      user: { id: result.user.id, email: result.user.email, name: result.user.name },
      linked: result.linked,
      existingProvider: result.existingProvider,
    },
  })
}
