import { Router } from 'express'
import {
  getExchangeRateHandler,
  refreshExchangeRateHandler,
} from '../../controllers/gcoin/exchangeRateController'
import { authMiddleware, requirePermission } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminGcoinExchangeRateRouter = Router()

adminGcoinExchangeRateRouter.use(authMiddleware, requirePermission('gcoinProducts'))

adminGcoinExchangeRateRouter.get('/', asyncHandler(getExchangeRateHandler))
adminGcoinExchangeRateRouter.post('/refresh', asyncHandler(refreshExchangeRateHandler))
