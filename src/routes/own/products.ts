import { Router } from 'express'
import {
  getOwnProductsHandler,
  getOwnProductDetailHandler,
  getOwnProductsSitemapHandler,
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
// '/:id'보다 먼저 등록해야 한다 — 뒤에 두면 'sitemap'이 :id로 잡혀 uuid 검증에서 400이 난다
ownProductsRouter.get('/sitemap', asyncHandler(getOwnProductsSitemapHandler))
ownProductsRouter.get('/:id', asyncHandler(getOwnProductDetailHandler))

// 인증 필요 API
ownProductsRouter.use(userAuthMiddleware)
ownProductsRouter.post('/:id/apply', asyncHandler(applyToPartyHandler))
ownProductsRouter.get('/:id/apply/check', asyncHandler(checkApplicationHandler))
