import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { csrfSynchronisedProtection, generateToken } from '../middleware/csrf.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { login, logout, me } from '../controllers/authController.js'

// Stricter limit for login: 5 failed attempts per 15 minutes per visitor
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true, // successful logins don't count
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
})

const router = Router()

router.use(csrfSynchronisedProtection)

router.get('/csrf-token', (req, res) => {
  res.json({ token: generateToken(req) })
})

router.post('/login', loginLimiter, login)
router.post('/logout', logout)
router.get('/me', requireAdmin, me)

export default router