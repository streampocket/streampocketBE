import { Router } from 'express'
import {
  createReviewHandler,
  getReviewHandler,
  getReviewableApplicationsHandler,
  issueReviewImageUploadUrlHandler,
  listReviewsHandler,
  updateReviewHandler,
} from '../../controllers/own/ownReviewController'
import { userAuthMiddleware } from '../../middlewares/userAuth'
import { asyncHandler } from '../../utils/asyncHandler'

export const ownReviewsRouter = Router()

// 공개 라우트 (인증 불필요)
ownReviewsRouter.get('/', asyncHandler(listReviewsHandler))
ownReviewsRouter.get('/eligible', userAuthMiddleware, asyncHandler(getReviewableApplicationsHandler))
ownReviewsRouter.post(
  '/uploads/presigned-url',
  userAuthMiddleware,
  asyncHandler(issueReviewImageUploadUrlHandler),
)
ownReviewsRouter.get('/:id', asyncHandler(getReviewHandler))

// 인증 필요 라우트
ownReviewsRouter.post('/', userAuthMiddleware, asyncHandler(createReviewHandler))
ownReviewsRouter.patch('/:id', userAuthMiddleware, asyncHandler(updateReviewHandler))
