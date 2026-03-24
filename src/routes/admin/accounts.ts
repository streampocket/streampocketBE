import { Router } from 'express'
import {
  getAccountsHandler,
  bulkCreateAccountsHandler,
  disableAccountHandler,
} from '../../controllers/steamAccountController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminAccountsRouter = Router()

adminAccountsRouter.use(authMiddleware)

adminAccountsRouter.get('/', asyncHandler(getAccountsHandler))
adminAccountsRouter.post('/bulk', asyncHandler(bulkCreateAccountsHandler))
adminAccountsRouter.patch('/:id/disable', asyncHandler(disableAccountHandler))
