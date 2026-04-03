import { Router } from 'express'
import { pollOrders } from '../controllers/steamCronController'
import { weeklySettlementHandler } from '../controllers/settlementController'
import { asyncHandler } from '../utils/asyncHandler'

export const cronRouter = Router()

cronRouter.post('/poll', asyncHandler(pollOrders))
cronRouter.post('/weekly-settlement', asyncHandler(weeklySettlementHandler))
