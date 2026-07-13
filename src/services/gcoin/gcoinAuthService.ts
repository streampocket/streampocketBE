import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import {
  createGcoinPhoneVerification,
  findLatestUnverified,
  markVerified,
  incrementAttempts,
  countRecentByPhone,
  findMostRecentByPhone,
} from '../../repositories/gcoin/gcoinPhoneVerificationRepository'
import {
  sendAlimtalkMessage,
  getEnvConfig,
  getActiveTemplateOrThrow,
  applyTemplate,
} from '../alimtalkService'

// GCOIN 구매자 인증 정책: 발송 5분당 1회, 코드 5분 유효 (템플릿 문구와 일치)
const CODE_EXPIRY_MINUTES = 5
const MAX_ATTEMPTS = 5
const RESEND_COOLDOWN_SECONDS = 300
const DAILY_LIMIT = 10

// 인증 성공 시 발급하는 구매자 토큰 — 1시간 로그인 유지
const TOKEN_EXPIRES_IN_SECONDS = 60 * 60

const GCOIN_ALIMTALK_STORE = 'pokemon_steam' as const

type GcoinBuyerJwtPayload = {
  phone: string
  type: 'gcoin_buyer'
}

function getGcoinJwtSecret(): string {
  const secret = process.env.JWT_GCOIN_SECRET
  if (!secret) {
    throw new Error('JWT_GCOIN_SECRET 환경변수가 설정되지 않았습니다.')
  }
  return secret
}

export async function sendAuthCode(
  phone: string,
  privacyAgreed: boolean,
): Promise<{ expiresIn: number; cooldown: number }> {
  if (!privacyAgreed) {
    throw Object.assign(new Error('개인정보 수집·이용 동의가 필요합니다.'), { statusCode: 400 })
  }

  // 5분 재발송 쿨다운
  const mostRecent = await findMostRecentByPhone(phone)
  if (mostRecent) {
    const elapsed = Date.now() - mostRecent.createdAt.getTime()
    if (elapsed < RESEND_COOLDOWN_SECONDS * 1000) {
      const remaining = Math.ceil((RESEND_COOLDOWN_SECONDS * 1000 - elapsed) / 1000)
      throw Object.assign(
        new Error(`인증번호는 5분에 1회만 요청할 수 있습니다. (${remaining}초 후 재시도)`),
        { statusCode: 429 },
      )
    }
  }

  // 일일 발송 한도
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayCount = await countRecentByPhone(phone, todayStart)
  if (todayCount >= DAILY_LIMIT) {
    throw Object.assign(new Error('일일 인증 요청 한도를 초과했습니다.'), { statusCode: 429 })
  }

  const code = String(crypto.randomInt(100000, 999999))
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000)

  await createGcoinPhoneVerification({ phone, code, expiresAt, privacyAgreedAt: new Date() })

  // 개발 모드: 콘솔 출력만 (기존 OTTALL 인증과 동일 패턴)
  if (process.env.NODE_ENV === 'development') {
    console.info(`[DEV] GCOIN 인증번호: ${code} (phone: ${phone})`)
  } else {
    const templateCode = process.env.ALIGO_TEMPLATE_CODE_GCOIN_VERIFY_POKEMON
    if (!templateCode) {
      throw new Error('ALIGO_TEMPLATE_CODE_GCOIN_VERIFY_POKEMON 환경변수가 설정되지 않았습니다.')
    }

    // 포켓몬스팀 알리고 계정으로만 발송 (교차 발신 금지 규칙)
    const config = getEnvConfig(GCOIN_ALIMTALK_STORE)
    const template = await getActiveTemplateOrThrow(config, templateCode)
    const templateContent = template.templateContent ?? ''
    const message = applyTemplate(templateContent, { 인증번호: code })

    await sendAlimtalkMessage(
      {
        templateCode,
        recipientPhoneNumber: phone,
        recipientName: null,
        message,
      },
      GCOIN_ALIMTALK_STORE,
    )
  }

  return { expiresIn: CODE_EXPIRY_MINUTES * 60, cooldown: RESEND_COOLDOWN_SECONDS }
}

export async function verifyAuthCode(
  phone: string,
  code: string,
): Promise<{ token: string; expiresIn: number; phone: string }> {
  const record = await findLatestUnverified(phone)
  if (!record) {
    throw Object.assign(new Error('인증 요청을 찾을 수 없습니다.'), { statusCode: 400 })
  }

  if (record.expiresAt < new Date()) {
    throw Object.assign(new Error('인증번호가 만료되었습니다. 다시 요청해주세요.'), {
      statusCode: 400,
    })
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    throw Object.assign(new Error('인증 시도 횟수를 초과했습니다. 다시 요청해주세요.'), {
      statusCode: 400,
    })
  }

  await incrementAttempts(record.id)

  if (record.code !== code) {
    throw Object.assign(new Error('인증번호가 일치하지 않습니다.'), { statusCode: 400 })
  }

  await markVerified(record.id)

  const payload: GcoinBuyerJwtPayload = { phone, type: 'gcoin_buyer' }
  const token = jwt.sign(payload, getGcoinJwtSecret(), {
    expiresIn: TOKEN_EXPIRES_IN_SECONDS,
  })

  return { token, expiresIn: TOKEN_EXPIRES_IN_SECONDS, phone }
}
