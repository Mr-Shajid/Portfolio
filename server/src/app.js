import express from 'express'

const app = express()


app.use(express.json({ limit: '10kb' }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

export default app