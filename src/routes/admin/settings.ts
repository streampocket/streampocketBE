import { Router } from 'express'
import {
  getCommissionRateHandler,
  updateCommissionRateHandler,
  getAdjustmentHandler,
  updateAdjustmentHandler,
} from '../../controllers/settingsController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminSettingsRouter = Router()

adminSettingsRouter.use(authMiddleware)

adminSettingsRouter.get('/commission', asyncHandler(getCommissionRateHandler))
adminSettingsRouter.put('/commission', asyncHandler(updateCommissionRateHandler))
adminSettingsRouter.get('/adjustments/:yearMonth', asyncHandler(getAdjustmentHandler))
adminSettingsRouter.put('/adjustments/:yearMonth', asyncHandler(updateAdjustmentHandler))
