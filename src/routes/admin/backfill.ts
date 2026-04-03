import { Router } from 'express'
import { backfillDecisionDatesHandler } from '../../controllers/backfillController'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminBackfillRouter = Router()

adminBackfillRouter.post('/decision-dates', asyncHandler(backfillDecisionDatesHandler))
