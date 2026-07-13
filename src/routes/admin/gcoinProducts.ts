import { Router } from 'express'
import {
  adminCreateGcoinProductHandler,
  adminGetGcoinProductsHandler,
  adminGetGcoinProductDetailHandler,
  adminUpdateGcoinProductHandler,
  adminDeleteGcoinProductHandler,
  adminIssueGcoinImageUploadUrlHandler,
} from '../../controllers/gcoin/gcoinProductController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminGcoinProductsRouter = Router()

adminGcoinProductsRouter.use(authMiddleware)

adminGcoinProductsRouter.post('/', asyncHandler(adminCreateGcoinProductHandler))
adminGcoinProductsRouter.get('/', asyncHandler(adminGetGcoinProductsHandler))
adminGcoinProductsRouter.post(
  '/uploads/presigned-url',
  asyncHandler(adminIssueGcoinImageUploadUrlHandler),
)
adminGcoinProductsRouter.get('/:id', asyncHandler(adminGetGcoinProductDetailHandler))
adminGcoinProductsRouter.patch('/:id', asyncHandler(adminUpdateGcoinProductHandler))
adminGcoinProductsRouter.delete('/:id', asyncHandler(adminDeleteGcoinProductHandler))
