import { Router } from 'express'
import {
  adminGetApplicationsHandler,
  adminGetApplicationDetailHandler,
  adminGetApplicationHoursHandler,
  adminApproveApplicationHandler,
  adminRejectApplicationHandler,
  adminCancelApplicationHandler,
} from '../../controllers/own/partyApplicationController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOwnApplicationsRouter = Router()

adminOwnApplicationsRouter.use(authMiddleware)

adminOwnApplicationsRouter.get('/', asyncHandler(adminGetApplicationsHandler))
// '/:id'보다 먼저 — 뒤에 두면 'hourly'가 신청 id로 잡힌다
adminOwnApplicationsRouter.get('/hourly', asyncHandler(adminGetApplicationHoursHandler))
adminOwnApplicationsRouter.get('/:id', asyncHandler(adminGetApplicationDetailHandler))
adminOwnApplicationsRouter.post('/:id/approve', asyncHandler(adminApproveApplicationHandler))
adminOwnApplicationsRouter.post('/:id/reject', asyncHandler(adminRejectApplicationHandler))
adminOwnApplicationsRouter.post('/:id/cancel', asyncHandler(adminCancelApplicationHandler))
