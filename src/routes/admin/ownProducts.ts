import { Router } from 'express'
import {
  adminCreateOwnProductHandler,
  adminDuplicateOwnProductHandler,
  adminGetOwnProductsHandler,
  adminGetOwnProductDetailHandler,
  adminUpdatePartyStatusHandler,
  adminUpdateOwnProductHandler,
  adminDeleteOwnProductHandler,
} from '../../controllers/own/ownProductController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOwnProductsRouter = Router()

adminOwnProductsRouter.use(authMiddleware)

adminOwnProductsRouter.post('/', asyncHandler(adminCreateOwnProductHandler))
adminOwnProductsRouter.post('/:id/duplicate', asyncHandler(adminDuplicateOwnProductHandler))
adminOwnProductsRouter.get('/', asyncHandler(adminGetOwnProductsHandler))
adminOwnProductsRouter.get('/:id', asyncHandler(adminGetOwnProductDetailHandler))
adminOwnProductsRouter.patch('/:id/status', asyncHandler(adminUpdatePartyStatusHandler))
adminOwnProductsRouter.patch('/:id', asyncHandler(adminUpdateOwnProductHandler))
adminOwnProductsRouter.delete('/:id', asyncHandler(adminDeleteOwnProductHandler))
