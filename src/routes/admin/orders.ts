import { Router } from 'express'
import {
  getOrdersHandler,
  getOrderDetailHandler,
  retryOrderHandler,
  markInProgressHandler,
  extendOrderTimeHandler,
  manualCompleteHandler,
  manualReturnHandler,
  exportOrdersHandler,
  updateFriendLinksHandler,
  sendOrderStatusAlimtalkHandler,
  createManualOrderHandler,
} from '../../controllers/steamOrderController'
import { sendReviewGameHandler } from '../../controllers/reviewGameController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOrdersRouter = Router()

adminOrdersRouter.use(authMiddleware)

adminOrdersRouter.get('/', asyncHandler(getOrdersHandler))
adminOrdersRouter.get('/export', asyncHandler(exportOrdersHandler))
adminOrdersRouter.post('/manual', asyncHandler(createManualOrderHandler))
adminOrdersRouter.get('/:id', asyncHandler(getOrderDetailHandler))
adminOrdersRouter.post('/:id/retry', asyncHandler(retryOrderHandler))
adminOrdersRouter.post('/:id/in-progress', asyncHandler(markInProgressHandler))
adminOrdersRouter.post('/:id/extend-time', asyncHandler(extendOrderTimeHandler))
adminOrdersRouter.post('/:id/complete', asyncHandler(manualCompleteHandler))
adminOrdersRouter.post('/:id/return', asyncHandler(manualReturnHandler))
adminOrdersRouter.post('/:id/review-game', asyncHandler(sendReviewGameHandler))
adminOrdersRouter.patch('/:id/friend-links', asyncHandler(updateFriendLinksHandler))
adminOrdersRouter.post(
  '/:id/order-status-alimtalk',
  asyncHandler(sendOrderStatusAlimtalkHandler),
)
