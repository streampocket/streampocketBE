import { Router } from 'express'
import { recordGcoinVisitHandler } from '../../controllers/siteVisitController'
import { asyncHandler } from '../../utils/asyncHandler'

// 공개 방문 기록 — authMiddleware 미적용 (비로그인 방문자 집계)
export const gcoinVisitsRouter = Router()

gcoinVisitsRouter.post('/', asyncHandler(recordGcoinVisitHandler))
