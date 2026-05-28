import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth'
import { getRegistrationByOrderHandler } from '../../controllers/steamRegistrationController'
import { asyncHandler } from '../../utils/asyncHandler'

// 자동 친구링크 기능이 주문에 연결된 스팀 자격증명을 조회하기 위해 사용한다.
export const adminRegistrationsRouter = Router()

adminRegistrationsRouter.use(authMiddleware)

adminRegistrationsRouter.get('/by-order', asyncHandler(getRegistrationByOrderHandler))
