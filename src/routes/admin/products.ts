import { Router } from 'express'
import {
  getProductsHandler,
  getProductDetailHandler,
  createProductHandler,
  updateProductHandler,
  syncProductsHandler,
} from '../../controllers/steamProductController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminProductsRouter = Router()

adminProductsRouter.use(authMiddleware)

adminProductsRouter.get('/', asyncHandler(getProductsHandler))
adminProductsRouter.post('/sync', asyncHandler(syncProductsHandler))
adminProductsRouter.get('/:id', asyncHandler(getProductDetailHandler))
adminProductsRouter.post('/', asyncHandler(createProductHandler))
adminProductsRouter.patch('/:id', asyncHandler(updateProductHandler))
