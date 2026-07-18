import { Router } from 'express'
import {
  getDashboardStatsHandler,
  getRevenueCalendarHandler,
  getDailyReportHandler,
  saveDailyMemoHandler,
  getDashboardExtrasHandler,
} from '../../controllers/steamDashboardController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminDashboardRouter = Router()

adminDashboardRouter.use(authMiddleware)

adminDashboardRouter.get('/stats', asyncHandler(getDashboardStatsHandler))
adminDashboardRouter.get('/revenue-calendar', asyncHandler(getRevenueCalendarHandler))
adminDashboardRouter.get('/daily-report', asyncHandler(getDailyReportHandler))
adminDashboardRouter.put('/daily-memo', asyncHandler(saveDailyMemoHandler))
adminDashboardRouter.get('/extras', asyncHandler(getDashboardExtrasHandler))
