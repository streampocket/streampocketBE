import { Router } from 'express'
import {
  getExpensesHandler,
  getExpenseSummaryHandler,
  createExpenseHandler,
  updateExpenseHandler,
  deleteExpenseHandler,
} from '../../controllers/expenseController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminExpensesRouter = Router()

adminExpensesRouter.use(authMiddleware)

adminExpensesRouter.get('/', asyncHandler(getExpensesHandler))
adminExpensesRouter.get('/summary', asyncHandler(getExpenseSummaryHandler))
adminExpensesRouter.post('/', asyncHandler(createExpenseHandler))
adminExpensesRouter.put('/:id', asyncHandler(updateExpenseHandler))
adminExpensesRouter.delete('/:id', asyncHandler(deleteExpenseHandler))
