import { Router } from 'express'
import {
  getOwnMessageTemplatesHandler,
  createOwnMessageTemplateHandler,
  updateOwnMessageTemplateHandler,
  deleteOwnMessageTemplateHandler,
  reorderOwnMessageTemplatesHandler,
} from '../../controllers/own/ownMessageTemplateController'
import { authMiddleware, requirePermission } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOwnMessageTemplatesRouter = Router()

adminOwnMessageTemplatesRouter.use(authMiddleware, requirePermission('messageTemplates'))

adminOwnMessageTemplatesRouter.get('/', asyncHandler(getOwnMessageTemplatesHandler))
adminOwnMessageTemplatesRouter.post('/', asyncHandler(createOwnMessageTemplateHandler))
// '/:id'보다 먼저 — 뒤에 두면 'reorder'가 양식 id로 잡힌다
adminOwnMessageTemplatesRouter.patch('/reorder', asyncHandler(reorderOwnMessageTemplatesHandler))
adminOwnMessageTemplatesRouter.patch('/:id', asyncHandler(updateOwnMessageTemplateHandler))
adminOwnMessageTemplatesRouter.delete('/:id', asyncHandler(deleteOwnMessageTemplateHandler))
