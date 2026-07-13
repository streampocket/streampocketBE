import { Router } from 'express'
import {
  getPublicGcoinProductsHandler,
  getPublicGcoinProductDetailHandler,
} from '../../controllers/gcoin/gcoinProductController'
import { asyncHandler } from '../../utils/asyncHandler'

export const gcoinProductsRouter = Router()

gcoinProductsRouter.get('/', asyncHandler(getPublicGcoinProductsHandler))
gcoinProductsRouter.get('/:id', asyncHandler(getPublicGcoinProductDetailHandler))
