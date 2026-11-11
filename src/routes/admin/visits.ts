import { Router } from 'express'
import { adminGetVisitStatsHandler } from '../../controllers/siteVisitController'
import { authMiddleware, requirePermission } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminVisitsRouter = Router()

adminVisitsRouter.use(authMiddleware, requirePermission('visits'))

adminVisitsRouter.get('/', asyncHandler(adminGetVisitStatsHandler))
