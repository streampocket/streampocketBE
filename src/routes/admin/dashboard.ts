import { Router } from 'express'
import { getDashboardStats } from '../../controllers/dashboardController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminDashboardRouter = Router()

adminDashboardRouter.use(authMiddleware)

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: 대시보드 통계 조회
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 통계 데이터
 */
adminDashboardRouter.get('/stats', asyncHandler(getDashboardStats))
