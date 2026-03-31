import { Router } from 'express'
import {
  getAccountsHandler,
  bulkCreateAccountsHandler,
  disableAccountHandler,
  exportAccountsHandler,
  updateAccountHandler,
  deleteAccountHandler,
} from '../../controllers/steamAccountController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminAccountsRouter = Router()

adminAccountsRouter.use(authMiddleware)

adminAccountsRouter.get('/', asyncHandler(getAccountsHandler))
adminAccountsRouter.get('/export', asyncHandler(exportAccountsHandler))
adminAccountsRouter.post('/bulk', asyncHandler(bulkCreateAccountsHandler))
adminAccountsRouter.patch('/:id/disable', asyncHandler(disableAccountHandler))
adminAccountsRouter.put('/:id', asyncHandler(updateAccountHandler))
adminAccountsRouter.delete('/:id', asyncHandler(deleteAccountHandler))
