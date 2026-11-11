import { Router } from 'express'
import {
  backfillDecisionDatesHandler,
  backfillPaymentAmountsHandler,
} from '../../controllers/backfillController'
import { authMiddleware, requireOwner } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

// 데이터 일괄 보정 도구 — 사장 전용
export const adminBackfillRouter = Router()

adminBackfillRouter.use(authMiddleware, requireOwner)

adminBackfillRouter.post('/decision-dates', asyncHandler(backfillDecisionDatesHandler))
adminBackfillRouter.post('/payment-amounts', asyncHandler(backfillPaymentAmountsHandler))
