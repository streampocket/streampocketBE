import { Router } from 'express'
import {
  createOwnProductHandler,
  getOwnProductsHandler,
  getMyOwnProductsHandler,
  getOwnProductDetailHandler,
  updateOwnProductHandler,
  closeOwnProductHandler,
  deleteOwnProductHandler,
} from '../../controllers/own/ownProductController'
import { userAuthMiddleware } from '../../middlewares/userAuth'
import { asyncHandler } from '../../utils/asyncHandler'

export const ownProductsRouter = Router()

// 공개 API (인증 불필요)
ownProductsRouter.get('/', asyncHandler(getOwnProductsHandler))

// /my는 /:id보다 먼저 등록해야 Express가 'my'를 :id로 매칭하지 않음
ownProductsRouter.get('/my', userAuthMiddleware, asyncHandler(getMyOwnProductsHandler))

// 공개 API (인증 불필요)
ownProductsRouter.get('/:id', asyncHandler(getOwnProductDetailHandler))

// 인증 필요 API
ownProductsRouter.use(userAuthMiddleware)
ownProductsRouter.post('/', asyncHandler(createOwnProductHandler))
ownProductsRouter.patch('/:id', asyncHandler(updateOwnProductHandler))
ownProductsRouter.patch('/:id/close', asyncHandler(closeOwnProductHandler))
ownProductsRouter.delete('/:id', asyncHandler(deleteOwnProductHandler))
