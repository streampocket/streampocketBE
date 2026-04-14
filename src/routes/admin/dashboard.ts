import { Router } from 'express'
import {
  getDashboardStatsHandler,
  getRevenueChartHandler,
  getDashboardExtrasHandler,
} from '../../controllers/steamDashboardController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminDashboardRouter = Router()

adminDashboardRouter.use(authMiddleware)

adminDashboardRouter.get('/stats', asyncHandler(getDashboardStatsHandler))
adminDashboardRouter.get('/revenue-chart', asyncHandler(getRevenueChartHandler))
adminDashboardRouter.get('/extras', asyncHandler(getDashboardExtrasHandler))
