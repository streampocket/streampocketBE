import { Request, Response, NextFunction } from 'express'

type AppError = Error & { statusCode?: number; code?: string }

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
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
