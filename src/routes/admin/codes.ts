import { Router } from 'express'
import {
  getCodesHandler,
  bulkCreateCodesHandler,
  disableCodeHandler,
} from '../../controllers/steamCodeController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminCodesRouter = Router()

adminCodesRouter.use(authMiddleware)

adminCodesRouter.get('/', asyncHandler(getCodesHandler))
adminCodesRouter.post('/bulk', asyncHandler(bulkCreateCodesHandler))
adminCodesRouter.patch('/:id/disable', asyncHandler(disableCodeHandler))
