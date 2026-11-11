import { Router } from 'express'
import {
  adminGetGcoinOrdersHandler,
  adminApproveGcoinOrderHandler,
  adminRejectGcoinOrderHandler,
} from '../../controllers/gcoin/gcoinOrderController'
import { authMiddleware, requirePermission } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminGcoinOrdersRouter = Router()

adminGcoinOrdersRouter.use(authMiddleware, requirePermission('gcoinOrders'))

adminGcoinOrdersRouter.get('/', asyncHandler(adminGetGcoinOrdersHandler))
adminGcoinOrdersRouter.post('/:id/approve', asyncHandler(adminApproveGcoinOrderHandler))
adminGcoinOrdersRouter.post('/:id/reject', asyncHandler(adminRejectGcoinOrderHandler))
