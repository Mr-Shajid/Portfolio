import express from 'express'
import mongoose from 'mongoose'

const app = express()

// Lets the server read JSON sent in request bodies
app.use(express.json({ limit: '10kb' }))

// Health check: 
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
  })
})

export default app