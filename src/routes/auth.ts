import { Router } from 'express'
import { loginHandler } from '../controllers/authController'
import { asyncHandler } from '../utils/asyncHandler'

export const authRouter = Router()

authRouter.post('/login', asyncHandler(loginHandler))
