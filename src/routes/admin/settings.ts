import { Router } from 'express'
import {
  getAlimtalkUnitCostHandler,
  updateAlimtalkUnitCostHandler,
} from '../../controllers/settingsController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminSettingsRouter = Router()

adminSettingsRouter.use(authMiddleware)

adminSettingsRouter.get('/alimtalk-cost', asyncHandler(getAlimtalkUnitCostHandler))
adminSettingsRouter.put('/alimtalk-cost', asyncHandler(updateAlimtalkUnitCostHandler))
