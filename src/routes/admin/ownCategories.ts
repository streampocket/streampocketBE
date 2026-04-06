import { Router } from 'express'
import {
  getOwnCategoriesHandler,
  createOwnCategoryHandler,
  updateOwnCategoryHandler,
  deleteOwnCategoryHandler,
} from '../../controllers/own/ownCategoryController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOwnCategoriesRouter = Router()

adminOwnCategoriesRouter.use(authMiddleware)

adminOwnCategoriesRouter.get('/', asyncHandler(getOwnCategoriesHandler))
adminOwnCategoriesRouter.post('/', asyncHandler(createOwnCategoryHandler))
adminOwnCategoriesRouter.patch('/:id', asyncHandler(updateOwnCategoryHandler))
adminOwnCategoriesRouter.delete('/:id', asyncHandler(deleteOwnCategoryHandler))
