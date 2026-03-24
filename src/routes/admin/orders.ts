import { Router } from 'express'
import { getOrders, getOrderDetail } from '../../controllers/orderController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminOrdersRouter = Router()

adminOrdersRouter.use(authMiddleware)

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: 주문 목록 조회
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer }
 *       - in: query
 *         name: platform
 *         schema: { type: string, enum: [NAVER, OWN] }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: 주문 목록
 */
adminOrdersRouter.get('/', asyncHandler(getOrders))

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: 주문 상세 조회
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: 주문 상세
 *       404:
 *         description: 주문 없음
 */
adminOrdersRouter.get('/:id', asyncHandler(getOrderDetail))
