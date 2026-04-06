import { Router } from 'express'
import { getOwnCategoriesHandler } from '../../controllers/own/ownCategoryController'
import { asyncHandler } from '../../utils/asyncHandler'

export const ownCategoriesRouter = Router()

// 공개 API (인증 불필요)
ownCategoriesRouter.get('/', asyncHandler(getOwnCategoriesHandler))
