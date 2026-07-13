import { Router } from 'express'
import {
  getExchangeRateHandler,
  refreshExchangeRateHandler,
} from '../../controllers/gcoin/exchangeRateController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminGcoinExchangeRateRouter = Router()

adminGcoinExchangeRateRouter.use(authMiddleware)

adminGcoinExchangeRateRouter.get('/', asyncHandler(getExchangeRateHandler))
adminGcoinExchangeRateRouter.post('/refresh', asyncHandler(refreshExchangeRateHandler))
