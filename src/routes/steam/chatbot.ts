import { Router } from 'express'
import { chatbotAuthMiddleware } from '../../middlewares/chatbotAuth'
import {
  answerMissingFieldSkillHandler,
  submitRegistrationSkillHandler,
  welcomeSkillHandler,
} from '../../controllers/steamChatbotController'
import { asyncHandler } from '../../utils/asyncHandler'

// 카카오 챗봇 스킬 서버 라우터 — authMiddleware 미적용, chatbotAuth 시크릿 검증
export const steamChatbotRouter = Router()

steamChatbotRouter.use(chatbotAuthMiddleware)

steamChatbotRouter.post('/registration', asyncHandler(submitRegistrationSkillHandler))
steamChatbotRouter.post('/registration/answer', asyncHandler(answerMissingFieldSkillHandler))
steamChatbotRouter.post('/welcome', asyncHandler(welcomeSkillHandler))
