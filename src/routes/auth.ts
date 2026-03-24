import { Router } from 'express'
import { login } from '../controllers/authController'
import { asyncHandler } from '../utils/asyncHandler'

export const authRouter = Router()

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 관리자 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       401:
 *         description: 인증 실패
 */
authRouter.post('/login', asyncHandler(login))
