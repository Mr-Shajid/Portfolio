import 'dotenv/config'
import app from './app.js'
import { connectDB } from './config/db.js'

const PORT = process.env.PORT || 5000

async function start() {
  // Without this, secure login cookies silently fail behind a proxy
  if (process.env.NODE_ENV === 'production' && !(Number(process.env.TRUST_PROXY_HOPS) > 0)) {
    console.error('TRUST_PROXY_HOPS must be set in production.')
    process.exit(1)
  }
  try {
    await connectDB()
  } catch (error) {
    // Print the reason, but never the connection string itself
    console.error('Could not connect to MongoDB:', error.message)
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

start()