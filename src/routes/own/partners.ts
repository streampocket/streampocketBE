import { Router } from 'express'
import {
  getMyPartnerHandler,
  applyPartnerHandler,
} from '../../controllers/own/partnerController'
import { userAuthMiddleware } from '../../middlewares/userAuth'
import { asyncHandler } from '../../utils/asyncHandler'

export const ownPartnersRouter = Router()

ownPartnersRouter.use(userAuthMiddleware)

ownPartnersRouter.get('/me', asyncHandler(getMyPartnerHandler))
ownPartnersRouter.post('/apply', asyncHandler(applyPartnerHandler))
