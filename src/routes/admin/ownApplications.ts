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
import { authMiddleware, requirePermission } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOwnApplicationsRouter = Router()

adminOwnApplicationsRouter.use(authMiddleware)

const canApplications = requirePermission('applications')

adminOwnApplicationsRouter.get('/', canApplications, asyncHandler(adminGetApplicationsHandler))
// '/:id'보다 먼저 — 뒤에 두면 'hourly'가 신청 id로 잡힌다
adminOwnApplicationsRouter.get('/hourly', requirePermission('applications', 'visits'), asyncHandler(adminGetApplicationHoursHandler))
adminOwnApplicationsRouter.get('/:id', canApplications, asyncHandler(adminGetApplicationDetailHandler))
// 세그먼트가 2개라 위 '/:id'에 잡히지 않는다 ('/:id/approve'와 같은 형태)
adminOwnApplicationsRouter.get(
  '/:id/assign-candidates',
  canApplications,
  asyncHandler(adminGetAssignCandidatesHandler),
)
adminOwnApplicationsRouter.post('/:id/approve', canApplications, asyncHandler(adminApproveApplicationHandler))
adminOwnApplicationsRouter.post('/:id/reject', canApplications, asyncHandler(adminRejectApplicationHandler))
// 파티원 취소 — 파티 관리 페이지도 사용
adminOwnApplicationsRouter.post(
  '/:id/cancel',
  requirePermission('applications', 'parties'),
  asyncHandler(adminCancelApplicationHandler),
)
