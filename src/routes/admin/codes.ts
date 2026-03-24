import { Router } from 'express'
import { getCodes, bulkCreateCodes } from '../../controllers/codeController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminCodesRouter = Router()

adminCodesRouter.use(authMiddleware)

/**
 * @swagger
 * /api/admin/codes:
 *   get:
 *     summary: 코드 목록 조회
 *     tags: [Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: 코드 목록
 */
adminCodesRouter.get('/', asyncHandler(getCodes))

/**
 * @swagger
 * /api/admin/codes/bulk:
 *   post:
 *     summary: 코드 일괄 등록
 *     tags: [Codes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 등록 완료
 */
adminCodesRouter.post('/bulk', asyncHandler(bulkCreateCodes))
