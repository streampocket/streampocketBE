import { Router } from 'express'
import {
  createGcoinOrderHandler,
  getMyGcoinOrdersHandler,
} from '../../controllers/gcoin/gcoinOrderController'
import { gcoinAuthMiddleware } from '../../middlewares/gcoinAuth'
import { asyncHandler } from '../../utils/asyncHandler'

export const gcoinOrdersRouter = Router()

gcoinOrdersRouter.use(gcoinAuthMiddleware)

gcoinOrdersRouter.post('/', asyncHandler(createGcoinOrderHandler))
gcoinOrdersRouter.get('/me', asyncHandler(getMyGcoinOrdersHandler))
