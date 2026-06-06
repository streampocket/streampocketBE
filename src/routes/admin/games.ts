import { Router } from 'express'
import {
  getGamesHandler,
  syncGamesHandler,
  mergeListingHandler,
  updateGameHandler,
} from '../../controllers/steamGameController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminGamesRouter = Router()

adminGamesRouter.use(authMiddleware)

adminGamesRouter.get('/', asyncHandler(getGamesHandler))
adminGamesRouter.post('/sync', asyncHandler(syncGamesHandler))
adminGamesRouter.patch('/listings/:id/merge', asyncHandler(mergeListingHandler))
adminGamesRouter.patch('/:id', asyncHandler(updateGameHandler))
