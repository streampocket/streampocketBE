import { Router } from 'express'
import {
  gcoinAuthSendHandler,
  gcoinAuthVerifyHandler,
} from '../../controllers/gcoin/gcoinAuthController'
import { asyncHandler } from '../../utils/asyncHandler'

export const gcoinAuthRouter = Router()

gcoinAuthRouter.post('/send', asyncHandler(gcoinAuthSendHandler))
gcoinAuthRouter.post('/verify', asyncHandler(gcoinAuthVerifyHandler))
