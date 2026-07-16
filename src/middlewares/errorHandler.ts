import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

type AppError = Error & { statusCode?: number; code?: string }

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod 입력 검증 실패는 400 — 첫 번째 이슈의 메시지를 그대로 노출 (스키마에 한국어 메시지 정의)
  if (err instanceof ZodError) {
    res.status(400).json({
      message: err.issues[0]?.message ?? '입력값이 올바르지 않습니다.',
    })
    return
  }

  const statusCode = err.statusCode ?? 500
  const message = statusCode === 500 ? '서버 오류가 발생했습니다.' : err.message

  if (statusCode === 500) {
    console.error('[ERROR]', err)
  }

  res.status(statusCode).json({
    message,
    ...(err.code ? { code: err.code } : {}),
  })
}
