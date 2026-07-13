import { Router } from 'express'
import {
  adminGetGcoinOrdersHandler,
  adminApproveGcoinOrderHandler,
  adminRejectGcoinOrderHandler,
} from '../../controllers/gcoin/gcoinOrderController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminGcoinOrdersRouter = Router()

adminGcoinOrdersRouter.use(authMiddleware)

adminGcoinOrdersRouter.get('/', asyncHandler(adminGetGcoinOrdersHandler))
adminGcoinOrdersRouter.post('/:id/approve', asyncHandler(adminApproveGcoinOrderHandler))
adminGcoinOrdersRouter.post('/:id/reject', asyncHandler(adminRejectGcoinOrderHandler))
