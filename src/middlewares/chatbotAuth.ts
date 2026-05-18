import { Request, Response, NextFunction } from 'express'
import { timingSafeEqual } from 'crypto'

// 길이가 달라도 안전하게 비교 (타이밍 공격 방지)
function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) return false
  return timingSafeEqual(bufferA, bufferB)
}

// 챗봇 스킬 엔드포인트 보호 — 오픈빌더 스킬 설정의 커스텀 헤더(X-Chatbot-Secret)로 시크릿 검증
export function chatbotAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const secret = process.env.CHATBOT_SKILL_SECRET

  if (!secret) {
    res.status(500).json({ message: '서버 설정 오류' })
    return
  }

  const provided = req.header('X-Chatbot-Secret')
  if (!provided || !safeEqual(provided, secret)) {
    res.status(401).json({ message: '인증 실패' })
    return
  }

  next()
}
