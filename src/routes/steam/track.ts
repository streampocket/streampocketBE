import { Router } from 'express'
import { getOrderTrackingHandler } from '../../controllers/steamTrackController'
import { asyncHandler } from '../../utils/asyncHandler'

// 구매자용 공개 진행상황 조회 라우터 — authMiddleware 미적용 (비로그인 접근)
export const steamTrackRouter = Router()

steamTrackRouter.get('/:productOrderId', asyncHandler(getOrderTrackingHandler))
