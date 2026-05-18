import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth'
import {
  getRegistrationByOrderHandler,
  getRegistrationDetailHandler,
  getRegistrationsHandler,
  linkOrderHandler,
  unlinkOrderHandler,
  updateRegistrationHandler,
} from '../../controllers/steamRegistrationController'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminRegistrationsRouter = Router()

adminRegistrationsRouter.use(authMiddleware)

// 고정 경로(/by-order)를 :id 보다 먼저 등록
adminRegistrationsRouter.get('/by-order', asyncHandler(getRegistrationByOrderHandler))
adminRegistrationsRouter.get('/', asyncHandler(getRegistrationsHandler))
adminRegistrationsRouter.get('/:id', asyncHandler(getRegistrationDetailHandler))
adminRegistrationsRouter.patch('/:id', asyncHandler(updateRegistrationHandler))
adminRegistrationsRouter.post('/:id/link', asyncHandler(linkOrderHandler))
adminRegistrationsRouter.post('/:id/unlink', asyncHandler(unlinkOrderHandler))
