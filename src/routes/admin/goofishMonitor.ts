import { Router } from 'express'
import {
  getGoofishTargetsHandler,
  createGoofishSnapshotsHandler,
  getGoofishReportHandler,
} from '../../controllers/goofishMonitorController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminGoofishMonitorRouter = Router()

adminGoofishMonitorRouter.use(authMiddleware)

adminGoofishMonitorRouter.get('/targets', asyncHandler(getGoofishTargetsHandler))
adminGoofishMonitorRouter.post('/snapshots', asyncHandler(createGoofishSnapshotsHandler))
adminGoofishMonitorRouter.get('/report', asyncHandler(getGoofishReportHandler))
