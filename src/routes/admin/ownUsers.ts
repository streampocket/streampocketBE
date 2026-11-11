import { Router } from 'express'
import {
  adminGetUsersHandler,
  adminGetUserDetailHandler,
  adminGetSignupStatsHandler,
  adminWithdrawUserHandler,
  adminReleaseReturnCooldownHandler,
} from '../../controllers/own/adminUserController'
import { authMiddleware, requirePermission } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOwnUsersRouter = Router()

adminOwnUsersRouter.use(authMiddleware)

const canUsers = requirePermission('users')

adminOwnUsersRouter.get('/', canUsers, asyncHandler(adminGetUsersHandler))
// '/:id'보다 먼저 — 뒤에 두면 'signup-stats'가 회원 id로 잡힌다
adminOwnUsersRouter.get('/signup-stats', requirePermission('users', 'visits'), asyncHandler(adminGetSignupStatsHandler))
adminOwnUsersRouter.get('/:id', canUsers, asyncHandler(adminGetUserDetailHandler))
adminOwnUsersRouter.post('/:id/withdraw', canUsers, asyncHandler(adminWithdrawUserHandler))
adminOwnUsersRouter.post(
  '/:id/release-return-cooldown',
  canUsers,
  asyncHandler(adminReleaseReturnCooldownHandler),
)
