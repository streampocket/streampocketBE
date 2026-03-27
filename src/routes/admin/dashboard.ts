import { Router } from 'express'
import { getDashboardStatsHandler } from '../../controllers/steamDashboardController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminDashboardRouter = Router()

adminDashboardRouter.use(authMiddleware)

adminDashboardRouter.get('/stats', asyncHandler(getDashboardStatsHandler))
