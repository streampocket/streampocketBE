import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import { requestLogger } from './middlewares/requestLogger'
import { errorHandler } from './middlewares/errorHandler'
import { authRouter } from './routes/auth'
import { cronRouter } from './routes/cron'
import { webhookRouter } from './routes/webhook'
import { adminOrdersRouter } from './routes/admin/orders'
import { adminProductsRouter } from './routes/admin/products'
import { adminCodesRouter } from './routes/admin/codes'
import { adminDashboardRouter } from './routes/admin/dashboard'

const app = express()

// ───────────────────────── Swagger ─────────────────────────
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: '스트림포켓 API', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts'],
})

// ───────────────────────── Middleware ─────────────────────────
app.use(helmet())
app.use(cors({ origin: process.env.FE_ORIGIN ?? 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(requestLogger)

// ───────────────────────── Routes ─────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/auth', authRouter)
app.use('/api/cron', cronRouter)
app.use('/api/webhook', webhookRouter)
app.use('/api/admin/orders', adminOrdersRouter)
app.use('/api/admin/products', adminProductsRouter)
app.use('/api/admin/codes', adminCodesRouter)
app.use('/api/admin/dashboard', adminDashboardRouter)

// ───────────────────────── Health ─────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// ───────────────────────── Error Handler ─────────────────────────
app.use(errorHandler)

export { app }
