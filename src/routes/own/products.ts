import { Router } from 'express'
import {
  getOwnProductsHandler,
  getOwnProductDetailHandler,
} from '../../controllers/own/ownProductController'
import {
  applyToPartyHandler,
  checkApplicationHandler,
} from '../../controllers/own/partyApplicationController'
import { userAuthMiddleware } from '../../middlewares/userAuth'
import { asyncHandler } from '../../utils/asyncHandler'

export const ownProductsRouter = Router()

// 공개 API (인증 불필요)
ownProductsRouter.get('/', asyncHandler(getOwnProductsHandler))
ownProductsRouter.get('/:id', asyncHandler(getOwnProductDetailHandler))

// 인증 필요 API
ownProductsRouter.use(userAuthMiddleware)
ownProductsRouter.post('/:id/apply', asyncHandler(applyToPartyHandler))
ownProductsRouter.get('/:id/apply/check', asyncHandler(checkApplicationHandler))
