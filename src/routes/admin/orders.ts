import { Router } from 'express'
import {
  getOrdersHandler,
  getOrderDetailHandler,
  retryOrderHandler,
  markInProgressHandler,
  syncNaverStatusHandler,
  extendOrderTimeHandler,
  manualCompleteHandler,
  confirmPartyOrderPurchaseHandler,
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
import {
  adminGetPartyOtpInfoHandler,
  adminSetPartyOtpSecretHandler,
  adminResetPartyOtpCountHandler,
  adminAutoAssignPartyAccountHandler,
  adminSyncPartyOtpSecretHandler,
} from '../../controllers/own/partyOtpController'
import { authMiddleware, requireOwner, requirePermission } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOrdersRouter = Router()

adminOrdersRouter.use(authMiddleware)

// ↓ 아래 router.use(requirePermission)보다 먼저 등록한 경로는 별도 권한 — 순서를 바꾸지 말 것
// 주문 목록은 매출(비용 등록 주문 선택)·대시보드(최근 주문)도 사용
adminOrdersRouter.get('/', requirePermission('orders', 'revenue', 'dashboard'), asyncHandler(getOrdersHandler))
// 주문 삭제는 사장 전용
adminOrdersRouter.delete('/:id', requireOwner, asyncHandler(deleteManualOrderHandler))

adminOrdersRouter.use(requirePermission('orders'))

adminOrdersRouter.get('/export', asyncHandler(exportOrdersHandler))
adminOrdersRouter.post('/manual', asyncHandler(createManualOrderHandler))
adminOrdersRouter.get('/:id', asyncHandler(getOrderDetailHandler))
adminOrdersRouter.post('/:id/retry', asyncHandler(retryOrderHandler))
adminOrdersRouter.post('/:id/in-progress', asyncHandler(markInProgressHandler))
adminOrdersRouter.post('/:id/sync-naver-status', asyncHandler(syncNaverStatusHandler))
adminOrdersRouter.post('/:id/extend-time', asyncHandler(extendOrderTimeHandler))
adminOrdersRouter.post('/:id/complete', asyncHandler(manualCompleteHandler))
adminOrdersRouter.post('/:id/purchase-decide', asyncHandler(confirmPartyOrderPurchaseHandler))
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
adminOrdersRouter.get('/:id/party-otp', asyncHandler(adminGetPartyOtpInfoHandler))
adminOrdersRouter.post('/:id/party-otp/secret', asyncHandler(adminSetPartyOtpSecretHandler))
adminOrdersRouter.post('/:id/party-otp/reset', asyncHandler(adminResetPartyOtpCountHandler))
adminOrdersRouter.post('/:id/party-otp/auto-assign', asyncHandler(adminAutoAssignPartyAccountHandler))
adminOrdersRouter.post('/:id/party-otp/sync-secret', asyncHandler(adminSyncPartyOtpSecretHandler))
