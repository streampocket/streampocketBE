import { Router } from 'express'
import { adminGetVisitStatsHandler } from '../../controllers/siteVisitController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminVisitsRouter = Router()

adminVisitsRouter.use(authMiddleware)

adminVisitsRouter.get('/', asyncHandler(adminGetVisitStatsHandler))
