import { Router } from 'express'
import {
  adminGetPaymentsHandler,
  adminGetPaymentDetailHandler,
  adminApprovePaymentHandler,
  adminRejectPaymentHandler,
} from '../../controllers/own/paymentController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOwnPaymentsRouter = Router()

adminOwnPaymentsRouter.use(authMiddleware)

adminOwnPaymentsRouter.get('/', asyncHandler(adminGetPaymentsHandler))
adminOwnPaymentsRouter.get('/:id', asyncHandler(adminGetPaymentDetailHandler))
adminOwnPaymentsRouter.patch('/:id/approve', asyncHandler(adminApprovePaymentHandler))
adminOwnPaymentsRouter.patch('/:id/reject', asyncHandler(adminRejectPaymentHandler))
