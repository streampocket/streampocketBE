import { Router } from 'express'
import {
  adminGetApplicationsHandler,
  adminGetApplicationDetailHandler,
  adminGetApplicationHoursHandler,
  adminApproveApplicationHandler,
  adminRejectApplicationHandler,
  adminCancelApplicationHandler,
  adminGetAssignCandidatesHandler,
} from '../../controllers/own/partyApplicationController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOwnApplicationsRouter = Router()

adminOwnApplicationsRouter.use(authMiddleware)

adminOwnApplicationsRouter.get('/', asyncHandler(adminGetApplicationsHandler))
// '/:id'보다 먼저 — 뒤에 두면 'hourly'가 신청 id로 잡힌다
adminOwnApplicationsRouter.get('/hourly', asyncHandler(adminGetApplicationHoursHandler))
adminOwnApplicationsRouter.get('/:id', asyncHandler(adminGetApplicationDetailHandler))
// 세그먼트가 2개라 위 '/:id'에 잡히지 않는다 ('/:id/approve'와 같은 형태)
adminOwnApplicationsRouter.get(
  '/:id/assign-candidates',
  asyncHandler(adminGetAssignCandidatesHandler),
)
adminOwnApplicationsRouter.post('/:id/approve', asyncHandler(adminApproveApplicationHandler))
adminOwnApplicationsRouter.post('/:id/reject', asyncHandler(adminRejectApplicationHandler))
adminOwnApplicationsRouter.post('/:id/cancel', asyncHandler(adminCancelApplicationHandler))
