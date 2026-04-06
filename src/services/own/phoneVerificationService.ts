import crypto from 'crypto'
import {
  createPhoneVerification,
  findLatestUnverified,
  findVerificationById,
  markVerified,
  incrementAttempts,
  countRecentByPhone,
  findMostRecentByPhone,
} from '../../repositories/own/phoneVerificationRepository'
import { sendAlimtalkMessage } from '../alimtalkService'

const CODE_EXPIRY_MINUTES = 3
const MAX_ATTEMPTS = 5
const RESEND_COOLDOWN_SECONDS = 60
const DAILY_LIMIT = 10

export async function sendCode(phone: string): Promise<{ expiresIn: number }> {
  // 60초 재발송 쿨다운
  const mostRecent = await findMostRecentByPhone(phone)
  if (mostRecent) {
    const elapsed = Date.now() - mostRecent.createdAt.getTime()
    if (elapsed < RESEND_COOLDOWN_SECONDS * 1000) {
      throw Object.assign(new Error('잠시 후 다시 시도해주세요.'), { statusCode: 429 })
    }
  }

  // 일일 발송 한도
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayCount = await countRecentByPhone(phone, todayStart)
  if (todayCount >= DAILY_LIMIT) {
    throw Object.assign(new Error('일일 인증 요청 한도를 초과했습니다.'), { statusCode: 429 })
  }

  // 6자리 인증번호 생성
  const code = String(crypto.randomInt(100000, 999999))
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000)

  await createPhoneVerification({ phone, code, expiresAt })

  // 개발 모드: 콘솔 출력만
  if (process.env.NODE_ENV === 'development') {
    console.info(`[DEV] 인증번호: ${code} (phone: ${phone})`)
  } else {
    const templateCode = process.env.ALIGO_TEMPLATE_CODE_PHONE_VERIFY
    if (!templateCode) {
      throw new Error('ALIGO_TEMPLATE_CODE_PHONE_VERIFY 환경변수가 설정되지 않았습니다.')
    }

    const message = [
      'OTTALL 인증번호 안내',
      '',
      '안녕하세요, OTTALL 입니다.',
      '',
      `요청하신 인증번호는 ${code} 입니다.`,
      '3분 내에 입력해주세요.',
      '',
      '본인이 요청하지 않았다면 이 메세지를 무시해주세요.',
    ].join('\n')

    await sendAlimtalkMessage({
      templateCode,
      recipientPhoneNumber: phone,
      recipientName: null,
      message,
    })
  }

  return { expiresIn: CODE_EXPIRY_MINUTES * 60 }
}

export async function verifyCode(
  phone: string,
  code: string,
): Promise<{ verified: boolean; verificationId: string }> {
  const record = await findLatestUnverified(phone)
  if (!record) {
    throw Object.assign(new Error('인증 요청을 찾을 수 없습니다.'), { statusCode: 400 })
  }

  if (record.expiresAt < new Date()) {
    throw Object.assign(new Error('인증번호가 만료되었습니다.'), { statusCode: 400 })
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    throw Object.assign(new Error('인증 시도 횟수를 초과했습니다.'), { statusCode: 400 })
  }

  await incrementAttempts(record.id)

  if (record.code !== code) {
    throw Object.assign(new Error('인증번호가 일치하지 않습니다.'), { statusCode: 400 })
  }

  await markVerified(record.id)

  return { verified: true, verificationId: record.id }
}

export async function isPhoneVerified(verificationId: string, phone: string): Promise<boolean> {
  const record = await findVerificationById(verificationId)
  if (!record) return false
  return record.verified && record.phone === phone
}
