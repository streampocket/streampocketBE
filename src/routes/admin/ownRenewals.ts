import { Router } from 'express'
import {
  adminApproveRenewalHandler,
  adminGetRenewalDetailHandler,
  adminRejectRenewalHandler,
} from '../../controllers/own/partyRenewalController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

// 파티 재구매(기간 연장) 관리 — 목록은 신청관리 목록(/own/admin/applications)에 섞여 나온다
export const adminOwnRenewalsRouter = Router()

adminOwnRenewalsRouter.use(authMiddleware)

adminOwnRenewalsRouter.get('/:id', asyncHandler(adminGetRenewalDetailHandler))
adminOwnRenewalsRouter.post('/:id/approve', asyncHandler(adminApproveRenewalHandler))
adminOwnRenewalsRouter.post('/:id/reject', asyncHandler(adminRejectRenewalHandler))
