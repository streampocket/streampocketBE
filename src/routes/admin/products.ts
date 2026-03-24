import { Router } from 'express'
import {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
} from '../../controllers/productController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminProductsRouter = Router()

adminProductsRouter.use(authMiddleware)

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: 상품 목록 조회
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 상품 목록
 */
adminProductsRouter.get('/', asyncHandler(getProducts))

/**
 * @swagger
 * /api/admin/products/{id}:
 *   get:
 *     summary: 상품 상세 조회
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: 상품 상세
 */
adminProductsRouter.get('/:id', asyncHandler(getProductDetail))

/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     summary: 상품 생성
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 생성 완료
 */
adminProductsRouter.post('/', asyncHandler(createProduct))

/**
 * @swagger
 * /api/admin/products/{id}:
 *   patch:
 *     summary: 상품 수정
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: 수정 완료
 */
adminProductsRouter.patch('/:id', asyncHandler(updateProduct))
