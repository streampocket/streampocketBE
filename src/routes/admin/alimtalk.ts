import { Router } from 'express'
import {
  getAlimtalkSettingsHandler,
  sendAlimtalkTestHandler,
  updateAlimtalkSettingsHandler,
} from '../../controllers/alimtalkController'
import { authMiddleware, requirePermission } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminAlimtalkRouter = Router()

adminAlimtalkRouter.use(authMiddleware)

const canAlimtalk = requirePermission('alimtalk')

// 템플릿 조회 — 주문 상세(상태 알림톡 발송)도 사용
adminAlimtalkRouter.get('/', requirePermission('alimtalk', 'orders'), asyncHandler(getAlimtalkSettingsHandler))
adminAlimtalkRouter.patch('/', canAlimtalk, asyncHandler(updateAlimtalkSettingsHandler))
adminAlimtalkRouter.post('/test', canAlimtalk, asyncHandler(sendAlimtalkTestHandler))
