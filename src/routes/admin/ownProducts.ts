import { Router } from 'express'
import {
  adminCreateOwnProductHandler,
  adminDuplicateOwnProductHandler,
  adminGetOwnProductsHandler,
  adminGetOwnProductDetailHandler,
  adminUpdatePartyStatusHandler,
  adminUpdateOwnProductHandler,
  adminDeleteOwnProductHandler,
} from '../../controllers/own/ownProductController'
import { authMiddleware, requirePermission } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOwnProductsRouter = Router()

adminOwnProductsRouter.use(authMiddleware)

const canParties = requirePermission('parties')
// 파티 복제·수정(자리 추가) — 신청 관리 페이지도 사용
const canPartiesOrApplications = requirePermission('parties', 'applications')

adminOwnProductsRouter.post('/', canParties, asyncHandler(adminCreateOwnProductHandler))
adminOwnProductsRouter.post('/:id/duplicate', canPartiesOrApplications, asyncHandler(adminDuplicateOwnProductHandler))
adminOwnProductsRouter.get('/', canParties, asyncHandler(adminGetOwnProductsHandler))
adminOwnProductsRouter.get('/:id', canParties, asyncHandler(adminGetOwnProductDetailHandler))
adminOwnProductsRouter.patch('/:id/status', canParties, asyncHandler(adminUpdatePartyStatusHandler))
adminOwnProductsRouter.patch('/:id', canPartiesOrApplications, asyncHandler(adminUpdateOwnProductHandler))
adminOwnProductsRouter.delete('/:id', canParties, asyncHandler(adminDeleteOwnProductHandler))
