import { Router } from 'express'
import { pollOrders } from '../controllers/cronController'
import { asyncHandler } from '../utils/asyncHandler'

export const cronRouter = Router()

/**
 * @swagger
 * /api/cron/poll:
 *   post:
 *     summary: 네이버 주문 폴링 트리거 (외부 스케줄러 호출)
 *     tags: [Cron]
 *     responses:
 *       200:
 *         description: 폴링 완료
 */
cronRouter.post('/poll', asyncHandler(pollOrders))
