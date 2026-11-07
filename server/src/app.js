import express from 'express'
import mongoose from 'mongoose'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { createSessionMiddleware } from './config/session.js'
import projectRoutes from './routes/projectRoutes.js'
import authRoutes from './routes/authRoutes.js'
import adminProjectRoutes from './routes/adminProjectRoutes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

// In production the server sits behind the host's proxy. This tells Express
// to trust it, which secure cookies need. We will verify this at deployment.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

app.use(helmet())

app.use(
  cors({
    origin: process.env.FRONTEND_URL || false,
    credentials: true, // lets the browser send the login cookie
  })
)

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many requests. Please try again later.' },
  })
)

app.use(express.json({ limit: '10kb' }))
app.use(createSessionMiddleware())

app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
  })
})

app.use('/api/projects', projectRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin/projects', adminProjectRoutes)

// These two must stay LAST
app.use(notFound)
app.use(errorHandler)

export default app