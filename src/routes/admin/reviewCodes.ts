import { Router } from 'express'
import {
  createReviewCodeBatchHandler,
  createReviewCodeHandler,
  deleteReviewCodeHandler,
  getReviewCodesHandler,
  updateReviewCodeHandler,
  updateReviewCodeStatusHandler,
} from '../../controllers/reviewCodeController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminReviewCodesRouter = Router()

adminReviewCodesRouter.use(authMiddleware)

adminReviewCodesRouter.get('/', asyncHandler(getReviewCodesHandler))
adminReviewCodesRouter.post('/', asyncHandler(createReviewCodeHandler))
adminReviewCodesRouter.post('/batch', asyncHandler(createReviewCodeBatchHandler))
adminReviewCodesRouter.put('/:id', asyncHandler(updateReviewCodeHandler))
adminReviewCodesRouter.patch('/:id/status', asyncHandler(updateReviewCodeStatusHandler))
adminReviewCodesRouter.delete('/:id', asyncHandler(deleteReviewCodeHandler))
