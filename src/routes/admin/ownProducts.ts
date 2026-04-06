import { Router } from 'express'
import {
  adminGetOwnProductsHandler,
  adminGetOwnProductDetailHandler,
  adminUpdateOwnProductHandler,
  adminDeleteOwnProductHandler,
} from '../../controllers/own/ownProductController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOwnProductsRouter = Router()

adminOwnProductsRouter.use(authMiddleware)

adminOwnProductsRouter.get('/', asyncHandler(adminGetOwnProductsHandler))
adminOwnProductsRouter.get('/:id', asyncHandler(adminGetOwnProductDetailHandler))
adminOwnProductsRouter.patch('/:id', asyncHandler(adminUpdateOwnProductHandler))
adminOwnProductsRouter.delete('/:id', asyncHandler(adminDeleteOwnProductHandler))
