import { Router } from 'express'
import {
  getGamesHandler,
  getGameOptionsHandler,
  syncGamesHandler,
  mergeListingHandler,
  mergeGameHandler,
  splitListingHandler,
  updateGameHandler,
} from '../../controllers/steamGameController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminGamesRouter = Router()

adminGamesRouter.use(authMiddleware)

adminGamesRouter.get('/', asyncHandler(getGamesHandler))
adminGamesRouter.get('/options', asyncHandler(getGameOptionsHandler))
adminGamesRouter.post('/sync', asyncHandler(syncGamesHandler))
adminGamesRouter.patch('/listings/:id/merge', asyncHandler(mergeListingHandler))
adminGamesRouter.patch('/listings/:id/split', asyncHandler(splitListingHandler))
adminGamesRouter.patch('/:id/merge-into', asyncHandler(mergeGameHandler))
adminGamesRouter.patch('/:id', asyncHandler(updateGameHandler))
