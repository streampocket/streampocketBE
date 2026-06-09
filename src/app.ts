import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import { requestLogger } from './middlewares/requestLogger'
import { errorHandler } from './middlewares/errorHandler'
import { authRouter } from './routes/auth'
import { cronRouter } from './routes/cron'
import { adminOrdersRouter } from './routes/admin/orders'
import { steamTrackRouter } from './routes/steam/track'
import { adminRegistrationsRouter } from './routes/admin/registrations'
import { adminProductsRouter } from './routes/admin/products'
import { adminGamesRouter } from './routes/admin/games'
import { adminAccountsRouter } from './routes/admin/accounts'
import { adminAlimtalkRouter } from './routes/admin/alimtalk'
import { adminDashboardRouter } from './routes/admin/dashboard'
import { adminSettingsRouter } from './routes/admin/settings'
import { adminReviewCodesRouter } from './routes/admin/reviewCodes'
import { adminExpensesRouter } from './routes/admin/expenses'
import { adminBackfillRouter } from './routes/admin/backfill'
import { adminManualRevenuesRouter } from './routes/admin/manualRevenues'
import { ownAuthRouter } from './routes/own/auth'
import { ownUsersRouter } from './routes/own/users'
import { ownCategoriesRouter } from './routes/own/categories'
import { ownProductsRouter } from './routes/own/products'
import { ownApplicationsRouter } from './routes/own/applications'
import { ownReviewsRouter } from './routes/own/reviews'
import { adminOwnCategoriesRouter } from './routes/admin/ownCategories'
import { adminOwnProductsRouter } from './routes/admin/ownProducts'
import { adminOwnApplicationsRouter } from './routes/admin/ownApplications'
import { adminOwnUsersRouter } from './routes/admin/ownUsers'
import { adminOwnReviewsRouter } from './routes/admin/ownReviews'
import { communityPostsRouter } from './routes/community/posts'
import { adminCommunityPostsRouter } from './routes/community/admin'

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
app.use(cookieParser())
app.use(express.json())
app.use(requestLogger)

// ───────────────────────── Routes ─────────────────────────
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/auth', authRouter)
app.use('/steam/cron', cronRouter)
app.use('/steam/track', steamTrackRouter)
app.use('/steam/admin/orders', adminOrdersRouter)
app.use('/steam/admin/registrations', adminRegistrationsRouter)
app.use('/steam/admin/products', adminProductsRouter)
app.use('/steam/admin/games', adminGamesRouter)
app.use('/steam/admin/accounts', adminAccountsRouter)
app.use('/steam/admin/alimtalk', adminAlimtalkRouter)
app.use('/steam/admin/dashboard', adminDashboardRouter)
app.use('/steam/admin/settings', adminSettingsRouter)
app.use('/steam/admin/review-codes', adminReviewCodesRouter)
app.use('/steam/admin/expenses', adminExpensesRouter)
app.use('/steam/admin/backfill', adminBackfillRouter)
app.use('/steam/admin/manual-revenues', adminManualRevenuesRouter)

// ───────────────────────── Own (OTTALL) ─────────────────────────
app.use('/own/auth', ownAuthRouter)
app.use('/own/users', ownUsersRouter)
app.use('/own/categories', ownCategoriesRouter)
app.use('/own/products', ownProductsRouter)
app.use('/own/applications', ownApplicationsRouter)
app.use('/own/reviews', ownReviewsRouter)
app.use('/own/admin/categories', adminOwnCategoriesRouter)
app.use('/own/admin/products', adminOwnProductsRouter)
app.use('/own/admin/applications', adminOwnApplicationsRouter)
app.use('/own/admin/users', adminOwnUsersRouter)
app.use('/own/admin/reviews', adminOwnReviewsRouter)

// ───────────────────────── Community ─────────────────────────
app.use('/community', communityPostsRouter)
app.use('/admin/community', adminCommunityPostsRouter)

// ───────────────────────── Health ─────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// ───────────────────────── Error Handler ─────────────────────────
app.use(errorHandler)

export { app }
