import { Router } from 'express'
import {
  getMyApplicationsHandler,
  getApplicationCredentialsHandler,
} from '../../controllers/own/partyApplicationController'
import { userAuthMiddleware } from '../../middlewares/userAuth'
import { asyncHandler } from '../../utils/asyncHandler'

export const ownApplicationsRouter = Router()

ownApplicationsRouter.use(userAuthMiddleware)
ownApplicationsRouter.get('/my', asyncHandler(getMyApplicationsHandler))
ownApplicationsRouter.get('/:id/credentials', asyncHandler(getApplicationCredentialsHandler))
