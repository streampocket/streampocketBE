import { Router } from 'express'
import {
  backupScanOrders,
  dailyReconcileOrders,
  pollOrders,
} from '../controllers/steamCronController'
import { weeklySettlementHandler } from '../controllers/settlementController'
import { expirePartiesHandler } from '../controllers/own/partyExpirationController'
import { dailyExpenseSummaryHandler } from '../controllers/expenseSummaryController'
import { asyncHandler } from '../utils/asyncHandler'

export const cronRouter = Router()

cronRouter.post('/poll', asyncHandler(pollOrders))
cronRouter.post('/backup-scan', asyncHandler(backupScanOrders))
cronRouter.post('/daily-reconcile', asyncHandler(dailyReconcileOrders))
cronRouter.post('/weekly-settlement', asyncHandler(weeklySettlementHandler))
cronRouter.post('/expire-parties', asyncHandler(expirePartiesHandler))
cronRouter.post('/daily-expense-summary', asyncHandler(dailyExpenseSummaryHandler))
