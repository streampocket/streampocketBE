import { Router } from 'express'
import {
  createPostHandler,
  deletePostHandler,
  getPostHandler,
  issueImageUploadUrlHandler,
  listPostIdsHandler,
  listPostsHandler,
  updatePostHandler,
} from '../../controllers/community/communityPostController'
import { userAuthMiddleware } from '../../middlewares/userAuth'
import { asyncHandler } from '../../utils/asyncHandler'

export const communityPostsRouter = Router()

communityPostsRouter.get('/posts', asyncHandler(listPostsHandler))
communityPostsRouter.get('/posts/sitemap', asyncHandler(listPostIdsHandler))
communityPostsRouter.post(
  '/uploads/presigned-url',
  userAuthMiddleware,
  asyncHandler(issueImageUploadUrlHandler),
)
communityPostsRouter.get('/posts/:id', asyncHandler(getPostHandler))
communityPostsRouter.post('/posts', userAuthMiddleware, asyncHandler(createPostHandler))
communityPostsRouter.patch('/posts/:id', userAuthMiddleware, asyncHandler(updatePostHandler))
communityPostsRouter.delete('/posts/:id', userAuthMiddleware, asyncHandler(deletePostHandler))
