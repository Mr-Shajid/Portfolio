import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import Project from '../src/models/Project.js'
import Admin from '../src/models/Admin.js'

// A throwaway login that exists only inside the test database
export const TEST_ADMIN = {
  email: 'admin@test.example',
  password: 'correct-horse-battery-12',
}

function databaseName(uri) {
  try {
    return new URL(uri).pathname.replace(/^\//, '')
  } catch {
    return ''
  }
}

// Connects to the TEST database and returns the Express app.
export async function startTestApp() {
  const testUri = process.env.MONGODB_URI_TEST
  if (!testUri) {
    throw new Error('MONGODB_URI_TEST is missing. Add it to server/.env')
  }

  const testDb = databaseName(testUri)
  if (!testDb.endsWith('_test')) {
    throw new Error('The test database name must end in _test. Refusing to run.')
  }
  if (process.env.MONGODB_URI && databaseName(process.env.MONGODB_URI) === testDb) {
    throw new Error('Test database is the same as the real database. Refusing to run.')
  }

  // Everything below must be set BEFORE the app is imported,
  // because the app reads these values when it loads.
  process.env.MONGODB_URI = testUri
  process.env.NODE_ENV = 'test'
  process.env.FRONTEND_URL = 'http://localhost:5173'
  process.env.SESSION_SECRET = 'test-only-secret-used-nowhere-else'

  // Tests must never send real emails
  process.env.RESEND_API_KEY = ''
  process.env.CONTACT_TO_EMAIL = ''

  await mongoose.connect(testUri, { serverSelectionTimeoutMS: 10000 })

  // Second safety check, on the connection that is actually open
  if (!mongoose.connection.name.endsWith('_test')) {
    await mongoose.disconnect()
    throw new Error('Connected to a database that is not a test database. Stopping.')
  }

  const { default: app } = await import('../src/app.js')
  return app
}

export async function stopTestApp() {
  await mongoose.disconnect()
}

// Empties the test collections
export async function resetDatabase() {
  if (!mongoose.connection.name.endsWith('_test')) {
    throw new Error('Refusing to delete data from a non-test database')
  }
  await Promise.all([Project.deleteMany({}), Admin.deleteMany({})])
}

export async function seedAdmin() {
  // Low cost factor (4) only to keep tests fast. The real app uses 12.
  const passwordHash = await bcrypt.hash(TEST_ADMIN.password, 4)
  await Admin.create({ email: TEST_ADMIN.email, passwordHash })
}

// Gets a CSRF token for the session held by this supertest agent
export async function getToken(agent) {
  const response = await agent.get('/api/auth/csrf-token')
  return response.body.token
}