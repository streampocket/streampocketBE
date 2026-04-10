import { Router } from 'express'
import {
  adminGetUsersHandler,
  adminGetUserDetailHandler,
} from '../../controllers/own/adminUserController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOwnUsersRouter = Router()

adminOwnUsersRouter.use(authMiddleware)

adminOwnUsersRouter.get('/', asyncHandler(adminGetUsersHandler))
adminOwnUsersRouter.get('/:id', asyncHandler(adminGetUserDetailHandler))
