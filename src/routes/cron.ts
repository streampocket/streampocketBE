import { Router } from 'express'
import {
  backupScanOrders,
  dailyReconcileOrders,
  pollOrders,
  zqbgPollOrders,
} from '../controllers/steamCronController'
import { weeklySettlementHandler } from '../controllers/settlementController'
import { expirePartiesHandler } from '../controllers/own/partyExpirationController'
import { dailySalesReportHandler } from '../controllers/dailySalesReportController'
import { asyncHandler } from '../utils/asyncHandler'

export const cronRouter = Router()

cronRouter.post('/poll', asyncHandler(pollOrders))
cronRouter.post('/backup-scan', asyncHandler(backupScanOrders))
cronRouter.post('/daily-reconcile', asyncHandler(dailyReconcileOrders))
cronRouter.post('/zqbg-poll', asyncHandler(zqbgPollOrders))
cronRouter.post('/weekly-settlement', asyncHandler(weeklySettlementHandler))
cronRouter.post('/expire-parties', asyncHandler(expirePartiesHandler))
cronRouter.post('/daily-sales-report', asyncHandler(dailySalesReportHandler))
