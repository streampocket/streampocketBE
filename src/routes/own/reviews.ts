import { Router } from 'express'
import {
  createReviewHandler,
  getReviewHandler,
  getReviewableApplicationsHandler,
  issueReviewImageUploadUrlHandler,
  listReviewsHandler,
  getReviewsSitemapHandler,
  updateReviewHandler,
} from '../../controllers/own/ownReviewController'
import { userAuthMiddleware } from '../../middlewares/userAuth'
import { asyncHandler } from '../../utils/asyncHandler'

export const ownReviewsRouter = Router()

// 공개 라우트 (인증 불필요)
ownReviewsRouter.get('/', asyncHandler(listReviewsHandler))
// '/:id'보다 먼저 등록해야 한다 (아래 '/eligible'과 같은 이유)
ownReviewsRouter.get('/sitemap', asyncHandler(getReviewsSitemapHandler))
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
