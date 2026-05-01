import { Router } from 'express'
import {
  adminGetApplicationsHandler,
  adminGetApplicationDetailHandler,
  adminApproveApplicationHandler,
  adminRejectApplicationHandler,
} from '../../controllers/own/partyApplicationController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOwnApplicationsRouter = Router()

adminOwnApplicationsRouter.use(authMiddleware)

adminOwnApplicationsRouter.get('/', asyncHandler(adminGetApplicationsHandler))
adminOwnApplicationsRouter.get('/:id', asyncHandler(adminGetApplicationDetailHandler))
adminOwnApplicationsRouter.post('/:id/approve', asyncHandler(adminApproveApplicationHandler))
adminOwnApplicationsRouter.post('/:id/reject', asyncHandler(adminRejectApplicationHandler))
