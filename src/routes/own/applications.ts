import { Router } from 'express'
import { getMyApplicationsHandler } from '../../controllers/own/partyApplicationController'
import { issuePartyOtpHandler } from '../../controllers/own/partyOtpController'
import {
  getRenewalQuoteHandler,
  requestRenewalHandler,
} from '../../controllers/own/partyRenewalController'
import { userAuthMiddleware } from '../../middlewares/userAuth'
import { asyncHandler } from '../../utils/asyncHandler'

export const ownApplicationsRouter = Router()

ownApplicationsRouter.use(userAuthMiddleware)
ownApplicationsRouter.get('/my', asyncHandler(getMyApplicationsHandler))
ownApplicationsRouter.post('/:id/otp', asyncHandler(issuePartyOtpHandler))
// 재구매(기간 연장) — :id는 원 신청 id
ownApplicationsRouter.get('/:id/renewal-quote', asyncHandler(getRenewalQuoteHandler))
ownApplicationsRouter.post('/:id/renewals', asyncHandler(requestRenewalHandler))
