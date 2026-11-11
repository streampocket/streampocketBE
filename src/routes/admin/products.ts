import { Router } from 'express'
import {
  getProductsHandler,
  getProductDetailHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  syncProductsHandler,
} from '../../controllers/steamProductController'
import { authMiddleware, requirePermission } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminProductsRouter = Router()

adminProductsRouter.use(authMiddleware, requirePermission('products'))

adminProductsRouter.get('/', asyncHandler(getProductsHandler))
adminProductsRouter.post('/sync', asyncHandler(syncProductsHandler))
adminProductsRouter.get('/:id', asyncHandler(getProductDetailHandler))
adminProductsRouter.post('/', asyncHandler(createProductHandler))
adminProductsRouter.patch('/:id', asyncHandler(updateProductHandler))
adminProductsRouter.delete('/:id', asyncHandler(deleteProductHandler))
