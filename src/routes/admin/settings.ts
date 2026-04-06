import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth'

export const adminSettingsRouter = Router()

adminSettingsRouter.use(authMiddleware)
