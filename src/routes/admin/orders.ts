import { Router } from 'express'
import {
  getOrdersHandler,
  getOrderDetailHandler,
  retryOrderHandler,
  markInProgressHandler,
  syncNaverStatusHandler,
  extendOrderTimeHandler,
  manualCompleteHandler,
  manualReturnHandler,
  exportOrdersHandler,
  updateFriendLinksHandler,
  sendOrderStatusAlimtalkHandler,
  createManualOrderHandler,
  deleteManualOrderHandler,
  updateManualOrderNetProfitHandler,
} from '../../controllers/steamOrderController'
import { sendReviewGameHandler } from '../../controllers/reviewGameController'
import {
  autoFriendLinkHandler,
  submitGuardCodeHandler,
  pollGuardHandler,
} from '../../controllers/steamFriendLinkController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOrdersRouter = Router()

adminOrdersRouter.use(authMiddleware)

adminOrdersRouter.get('/', asyncHandler(getOrdersHandler))
adminOrdersRouter.get('/export', asyncHandler(exportOrdersHandler))
adminOrdersRouter.post('/manual', asyncHandler(createManualOrderHandler))
adminOrdersRouter.delete('/:id', asyncHandler(deleteManualOrderHandler))
adminOrdersRouter.get('/:id', asyncHandler(getOrderDetailHandler))
adminOrdersRouter.post('/:id/retry', asyncHandler(retryOrderHandler))
adminOrdersRouter.post('/:id/in-progress', asyncHandler(markInProgressHandler))
adminOrdersRouter.post('/:id/sync-naver-status', asyncHandler(syncNaverStatusHandler))
adminOrdersRouter.post('/:id/extend-time', asyncHandler(extendOrderTimeHandler))
adminOrdersRouter.post('/:id/complete', asyncHandler(manualCompleteHandler))
adminOrdersRouter.post('/:id/return', asyncHandler(manualReturnHandler))
adminOrdersRouter.post('/:id/review-game', asyncHandler(sendReviewGameHandler))
adminOrdersRouter.patch('/:id/friend-links', asyncHandler(updateFriendLinksHandler))
adminOrdersRouter.patch('/:id/net-profit', asyncHandler(updateManualOrderNetProfitHandler))
adminOrdersRouter.post('/:id/auto-friend-link', asyncHandler(autoFriendLinkHandler))
adminOrdersRouter.post(
  '/:id/auto-friend-link/guard-code',
  asyncHandler(submitGuardCodeHandler),
)
adminOrdersRouter.post('/:id/auto-friend-link/status', asyncHandler(pollGuardHandler))
adminOrdersRouter.post(
  '/:id/order-status-alimtalk',
  asyncHandler(sendOrderStatusAlimtalkHandler),
)
