import { Router } from 'express'
import {
  getOrdersHandler,
  getOrderDetailHandler,
  retryOrderHandler,
} from '../../controllers/steamOrderController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOrdersRouter = Router()

adminOrdersRouter.use(authMiddleware)

adminOrdersRouter.get('/', asyncHandler(getOrdersHandler))
adminOrdersRouter.get('/:id', asyncHandler(getOrderDetailHandler))
adminOrdersRouter.post('/:id/retry', asyncHandler(retryOrderHandler))
