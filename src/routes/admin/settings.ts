import { Router } from 'express'
import { authMiddleware, requireOwner, requirePermission } from '../../middlewares/auth'
import {
  getPartyAutoAssignSettingHandler,
  getSystemSettingsHandler,
  updateSystemSettingsHandler,
} from '../../controllers/systemSettingsController'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminSettingsRouter = Router()

adminSettingsRouter.use(authMiddleware)

// 신청 승인의 자동 배정 여부 읽기 — 직원도 사장 설정대로 승인 (requireOwner보다 먼저 등록, 순서 유지)
adminSettingsRouter.get(
  '/party-auto-assign',
  requirePermission('applications'),
  asyncHandler(getPartyAutoAssignSettingHandler),
)

// 그 외 설정 조회·변경은 사장 전용 (자동 배정 토글 변경 포함)
adminSettingsRouter.use(requireOwner)

adminSettingsRouter.get('/', asyncHandler(getSystemSettingsHandler))
adminSettingsRouter.patch('/', asyncHandler(updateSystemSettingsHandler))
