import { Router } from 'express'
import {
  getAlimtalkSettingsHandler,
  sendAlimtalkTestHandler,
  updateAlimtalkSettingsHandler,
} from '../../controllers/alimtalkController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminAlimtalkRouter = Router()

adminAlimtalkRouter.use(authMiddleware)

adminAlimtalkRouter.get('/', asyncHandler(getAlimtalkSettingsHandler))
adminAlimtalkRouter.patch('/', asyncHandler(updateAlimtalkSettingsHandler))
adminAlimtalkRouter.post('/test', asyncHandler(sendAlimtalkTestHandler))
