import { Router } from 'express'
import {
  adminGetPartnersHandler,
  adminGetPartnerDetailHandler,
  adminApprovePartnerHandler,
  adminRejectPartnerHandler,
  adminDeletePartnerHandler,
  adminForceDeleteProductHandler,
} from '../../controllers/own/partnerController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOwnPartnersRouter = Router()

adminOwnPartnersRouter.use(authMiddleware)

adminOwnPartnersRouter.get('/', asyncHandler(adminGetPartnersHandler))
adminOwnPartnersRouter.get('/:id', asyncHandler(adminGetPartnerDetailHandler))
adminOwnPartnersRouter.patch('/:id/approve', asyncHandler(adminApprovePartnerHandler))
adminOwnPartnersRouter.patch('/:id/reject', asyncHandler(adminRejectPartnerHandler))
adminOwnPartnersRouter.delete('/:id', asyncHandler(adminDeletePartnerHandler))
adminOwnPartnersRouter.delete(
  '/:id/products/:productId',
  asyncHandler(adminForceDeleteProductHandler),
)
