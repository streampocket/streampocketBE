import { Router } from 'express'
import {
  getOwnRuleTemplatesHandler,
  createOwnRuleTemplateHandler,
  updateOwnRuleTemplateHandler,
  deleteOwnRuleTemplateHandler,
} from '../../controllers/own/ownRuleTemplateController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOwnRuleTemplatesRouter = Router()

adminOwnRuleTemplatesRouter.use(authMiddleware)

adminOwnRuleTemplatesRouter.get('/', asyncHandler(getOwnRuleTemplatesHandler))
adminOwnRuleTemplatesRouter.post('/', asyncHandler(createOwnRuleTemplateHandler))
adminOwnRuleTemplatesRouter.patch('/:id', asyncHandler(updateOwnRuleTemplateHandler))
adminOwnRuleTemplatesRouter.delete('/:id', asyncHandler(deleteOwnRuleTemplateHandler))
