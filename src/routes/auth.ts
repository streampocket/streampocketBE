import { Router } from 'express'
import { getMeHandler, loginHandler } from '../controllers/authController'
import { authMiddleware } from '../middlewares/auth'
import { asyncHandler } from '../utils/asyncHandler'

export const authRouter = Router()

authRouter.post('/login', asyncHandler(loginHandler))
authRouter.get('/me', authMiddleware, asyncHandler(getMeHandler))
