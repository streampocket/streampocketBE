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
import { adminAccountsRouter } from './routes/admin/accounts'
import { adminAlimtalkRouter } from './routes/admin/alimtalk'
import { adminDashboardRouter } from './routes/admin/dashboard'
import { adminSettingsRouter } from './routes/admin/settings'
import { adminReviewCodesRouter } from './routes/admin/reviewCodes'

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
  apis: ['./src/docs/**/*.yaml'],
})

// ───────────────────────── Middleware ─────────────────────────
app.use(helmet())
const allowedOrigins = (process.env.FE_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  }),
)
app.use(express.json())
app.use(requestLogger)

// ───────────────────────── Routes ─────────────────────────
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/auth', authRouter)
app.use('/steam/cron', cronRouter)
app.use('/steam/webhook', webhookRouter)
app.use('/steam/admin/orders', adminOrdersRouter)
app.use('/steam/admin/products', adminProductsRouter)
app.use('/steam/admin/accounts', adminAccountsRouter)
app.use('/steam/admin/alimtalk', adminAlimtalkRouter)
app.use('/steam/admin/dashboard', adminDashboardRouter)
app.use('/steam/admin/settings', adminSettingsRouter)
app.use('/steam/admin/review-codes', adminReviewCodesRouter)

// ───────────────────────── Health ─────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// ───────────────────────── Error Handler ─────────────────────────
app.use(errorHandler)

export { app }
