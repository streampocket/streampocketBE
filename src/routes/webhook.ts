import { Router } from 'express'
import { handlePaymentWebhook } from '../controllers/webhookController'
import { asyncHandler } from '../utils/asyncHandler'

export const webhookRouter = Router()

/**
 * @swagger
 * /api/webhook/payment:
 *   post:
 *     summary: 자체 플랫폼 결제 완료 웹훅
 *     tags: [Webhook]
 *     responses:
 *       200:
 *         description: 웹훅 처리 완료
 */
webhookRouter.post('/payment', asyncHandler(handlePaymentWebhook))
