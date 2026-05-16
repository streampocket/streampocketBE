import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth'
import {
  getSystemSettingsHandler,
  updateSystemSettingsHandler,
} from '../../controllers/systemSettingsController'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminSettingsRouter = Router()

adminSettingsRouter.use(authMiddleware)

adminSettingsRouter.get('/', asyncHandler(getSystemSettingsHandler))
adminSettingsRouter.patch('/', asyncHandler(updateSystemSettingsHandler))
