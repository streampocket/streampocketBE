import { Router } from 'express'
import { pollOrders } from '../controllers/steamCronController'
import { asyncHandler } from '../utils/asyncHandler'

export const cronRouter = Router()

cronRouter.post('/poll', asyncHandler(pollOrders))
