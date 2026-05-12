import { Router } from 'express'
import {
  adminCreatePostHandler,
  adminDeletePostHandler,
  adminIssueImageUploadUrlHandler,
  adminListPostsHandler,
  adminUpdatePostHandler,
} from '../../controllers/community/adminCommunityPostController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminCommunityPostsRouter = Router()

adminCommunityPostsRouter.use(authMiddleware)

adminCommunityPostsRouter.get('/posts', asyncHandler(adminListPostsHandler))
adminCommunityPostsRouter.post(
  '/uploads/presigned-url',
  asyncHandler(adminIssueImageUploadUrlHandler),
)
adminCommunityPostsRouter.post('/posts', asyncHandler(adminCreatePostHandler))
adminCommunityPostsRouter.patch('/posts/:id', asyncHandler(adminUpdatePostHandler))
adminCommunityPostsRouter.delete('/posts/:id', asyncHandler(adminDeletePostHandler))
