import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth'
import {
  createMenuHandler,
  deleteMenuHandler,
  getMenusHandler,
  issueMenuImageUploadUrlHandler,
  reorderMenusHandler,
  updateMenuHandler,
  updateWelcomeHandler,
} from '../../controllers/chatbotMenuController'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminChatbotMenusRouter = Router()

adminChatbotMenusRouter.use(authMiddleware)

// 고정 경로를 :id 보다 먼저 등록
adminChatbotMenusRouter.get('/', asyncHandler(getMenusHandler))
adminChatbotMenusRouter.put('/welcome', asyncHandler(updateWelcomeHandler))
adminChatbotMenusRouter.put('/reorder', asyncHandler(reorderMenusHandler))
adminChatbotMenusRouter.post('/image-upload-url', asyncHandler(issueMenuImageUploadUrlHandler))
adminChatbotMenusRouter.post('/', asyncHandler(createMenuHandler))
adminChatbotMenusRouter.patch('/:id', asyncHandler(updateMenuHandler))
adminChatbotMenusRouter.delete('/:id', asyncHandler(deleteMenuHandler))
