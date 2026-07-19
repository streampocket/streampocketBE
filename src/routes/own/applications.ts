import { Router } from 'express'
import { getMyApplicationsHandler } from '../../controllers/own/partyApplicationController'
import { issuePartyOtpHandler } from '../../controllers/own/partyOtpController'
import { userAuthMiddleware } from '../../middlewares/userAuth'
import { asyncHandler } from '../../utils/asyncHandler'

export const ownApplicationsRouter = Router()

ownApplicationsRouter.use(userAuthMiddleware)
ownApplicationsRouter.get('/my', asyncHandler(getMyApplicationsHandler))
ownApplicationsRouter.post('/:id/otp', asyncHandler(issuePartyOtpHandler))
