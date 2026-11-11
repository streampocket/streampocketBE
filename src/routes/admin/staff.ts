import { Router } from 'express'
import {
  createStaffHandler,
  deleteStaffHandler,
  listStaffHandler,
  resetStaffPasswordHandler,
  updateStaffHandler,
} from '../../controllers/staffController'
import { authMiddleware, requireOwner } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

// 직원(알바) 계정 관리 — 사장 전용
export const adminStaffRouter = Router()

adminStaffRouter.use(authMiddleware, requireOwner)

adminStaffRouter.get('/', asyncHandler(listStaffHandler))
adminStaffRouter.post('/', asyncHandler(createStaffHandler))
adminStaffRouter.patch('/:id', asyncHandler(updateStaffHandler))
adminStaffRouter.post('/:id/password', asyncHandler(resetStaffPasswordHandler))
adminStaffRouter.delete('/:id', asyncHandler(deleteStaffHandler))
