import { Router } from 'express'
import { getMeHandler, withdrawMeHandler } from '../../controllers/own/userController'
import { userAuthMiddleware } from '../../middlewares/userAuth'
import { asyncHandler } from '../../utils/asyncHandler'

export const ownUsersRouter = Router()

ownUsersRouter.use(userAuthMiddleware)

ownUsersRouter.get('/me', asyncHandler(getMeHandler))
ownUsersRouter.post('/me/withdraw', asyncHandler(withdrawMeHandler))
