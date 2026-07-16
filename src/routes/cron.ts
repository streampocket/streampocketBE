import { Router } from 'express'
import {
  backupScanOrders,
  dailyReconcileOrders,
  pollOrders,
  zqbgPollOrders,
  autoExtendCheckHandler,
} from '../controllers/steamCronController'
import { weeklySettlementHandler } from '../controllers/settlementController'
import { expirePartiesHandler } from '../controllers/own/partyExpirationController'
import { purgeWithdrawnUsersHandler } from '../controllers/own/userPurgeController'
import { dailySalesReportHandler } from '../controllers/dailySalesReportController'
import { asyncHandler } from '../utils/asyncHandler'

export const cronRouter = Router()

cronRouter.post('/poll', asyncHandler(pollOrders))
cronRouter.post('/backup-scan', asyncHandler(backupScanOrders))
cronRouter.post('/daily-reconcile', asyncHandler(dailyReconcileOrders))
cronRouter.post('/zqbg-poll', asyncHandler(zqbgPollOrders))
cronRouter.post('/auto-extend-check', asyncHandler(autoExtendCheckHandler))
cronRouter.post('/weekly-settlement', asyncHandler(weeklySettlementHandler))
cronRouter.post('/expire-parties', asyncHandler(expirePartiesHandler))
cronRouter.post('/purge-withdrawn-users', asyncHandler(purgeWithdrawnUsersHandler))
cronRouter.post('/daily-sales-report', asyncHandler(dailySalesReportHandler))
