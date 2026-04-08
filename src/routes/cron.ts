import { Router } from 'express'
import { pollOrders } from '../controllers/steamCronController'
import { weeklySettlementHandler } from '../controllers/settlementController'
import { expirePartiesHandler } from '../controllers/own/partyExpirationController'
import { asyncHandler } from '../utils/asyncHandler'

export const cronRouter = Router()

cronRouter.post('/poll', asyncHandler(pollOrders))
cronRouter.post('/weekly-settlement', asyncHandler(weeklySettlementHandler))
cronRouter.post('/expire-parties', asyncHandler(expirePartiesHandler))
