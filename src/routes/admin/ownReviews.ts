import { Router } from 'express'
import {
  adminDeleteReviewHandler,
  adminListReviewsHandler,
} from '../../controllers/own/ownReviewController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOwnReviewsRouter = Router()

adminOwnReviewsRouter.use(authMiddleware)
adminOwnReviewsRouter.get('/', asyncHandler(adminListReviewsHandler))
adminOwnReviewsRouter.delete('/:id', asyncHandler(adminDeleteReviewHandler))
