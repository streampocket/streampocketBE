import { Router } from 'express'
import {
  getEmailTemplateHandler,
  updateEmailTemplateHandler,
} from '../../controllers/emailTemplateController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminEmailTemplateRouter = Router()

adminEmailTemplateRouter.use(authMiddleware)

adminEmailTemplateRouter.get('/', asyncHandler(getEmailTemplateHandler))
adminEmailTemplateRouter.patch('/', asyncHandler(updateEmailTemplateHandler))
