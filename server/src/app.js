import express from 'express'
import mongoose from 'mongoose'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import projectRoutes from './routes/projectRoutes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

// Adds protective security headers
app.use(helmet())

// Only your own frontend may call this API from a browser.
// If FRONTEND_URL is missing, cross-origin requests are refused entirely.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || false,
    credentials: true, // needed later for the admin login cookie
  })
)

// General limit: 100 requests per 15 minutes per visitor
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

// Reads JSON bodies, capped at 10 kilobytes
app.use(express.json({ limit: '10kb' }))

// Health check: the app can be "ok" even if the database is down
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
  })
})

app.use('/api/projects', projectRoutes)

// These two must stay LAST
app.use(notFound)
app.use(errorHandler)

export default app