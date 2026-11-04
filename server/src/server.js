import 'dotenv/config'
import app from './app.js'
import { connectDB } from './config/db.js'

const PORT = process.env.PORT || 5000

async function start() {
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