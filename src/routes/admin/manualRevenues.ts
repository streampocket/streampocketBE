import { Router } from 'express'
import {
  getManualRevenuesHandler,
  getManualRevenueSummaryHandler,
  createManualRevenueHandler,
  updateManualRevenueHandler,
  deleteManualRevenueHandler,
} from '../../controllers/manualRevenueController'
import { authMiddleware, requirePermission } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminManualRevenuesRouter = Router()

adminManualRevenuesRouter.use(authMiddleware, requirePermission('revenue'))

adminManualRevenuesRouter.get('/', asyncHandler(getManualRevenuesHandler))
adminManualRevenuesRouter.get('/summary', asyncHandler(getManualRevenueSummaryHandler))
adminManualRevenuesRouter.post('/', asyncHandler(createManualRevenueHandler))
adminManualRevenuesRouter.put('/:id', asyncHandler(updateManualRevenueHandler))
adminManualRevenuesRouter.delete('/:id', asyncHandler(deleteManualRevenueHandler))
