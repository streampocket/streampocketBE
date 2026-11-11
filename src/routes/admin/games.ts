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
import { authMiddleware, requirePermission } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminGamesRouter = Router()

adminGamesRouter.use(authMiddleware)

const canProducts = requirePermission('products')

adminGamesRouter.get('/', canProducts, asyncHandler(getGamesHandler))
// 게임 드롭다운 — 계정 관리 페이지(코드 등록·필터)도 사용
adminGamesRouter.get('/options', requirePermission('products', 'accounts'), asyncHandler(getGameOptionsHandler))
adminGamesRouter.post('/sync', canProducts, asyncHandler(syncGamesHandler))
adminGamesRouter.patch('/listings/:id/merge', canProducts, asyncHandler(mergeListingHandler))
adminGamesRouter.patch('/listings/:id/split', canProducts, asyncHandler(splitListingHandler))
adminGamesRouter.patch('/:id/merge-into', canProducts, asyncHandler(mergeGameHandler))
adminGamesRouter.patch('/:id', canProducts, asyncHandler(updateGameHandler))
