import { Router } from 'express'
import { reportUserErrorHandler } from '../../controllers/own/userErrorController'
import { asyncHandler } from '../../utils/asyncHandler'

// 공개 오류 보고 — authMiddleware 미적용 (비회원 화면 크래시도 수집)
export const ownErrorsRouter = Router()

ownErrorsRouter.post('/', asyncHandler(reportUserErrorHandler))
