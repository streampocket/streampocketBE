import { Router } from 'express'
import {
  getCommissionRateHandler,
  updateCommissionRateHandler,
  getAlimtalkUnitCostHandler,
  updateAlimtalkUnitCostHandler,
} from '../../controllers/settingsController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminSettingsRouter = Router()

adminSettingsRouter.use(authMiddleware)

adminSettingsRouter.get('/commission', asyncHandler(getCommissionRateHandler))
adminSettingsRouter.put('/commission', asyncHandler(updateCommissionRateHandler))
adminSettingsRouter.get('/alimtalk-cost', asyncHandler(getAlimtalkUnitCostHandler))
adminSettingsRouter.put('/alimtalk-cost', asyncHandler(updateAlimtalkUnitCostHandler))
