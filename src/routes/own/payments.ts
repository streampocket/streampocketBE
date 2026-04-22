import { Router } from 'express'
import {
  userVerifyPaymentHandler,
  userAbortPaymentHandler,
} from '../../controllers/own/paymentController'
import { userAuthMiddleware } from '../../middlewares/userAuth'
import { asyncHandler } from '../../utils/asyncHandler'

export const ownPaymentsRouter = Router()

ownPaymentsRouter.use(userAuthMiddleware)
ownPaymentsRouter.post('/:id/verify', asyncHandler(userVerifyPaymentHandler))
ownPaymentsRouter.post('/:id/abort', asyncHandler(userAbortPaymentHandler))
