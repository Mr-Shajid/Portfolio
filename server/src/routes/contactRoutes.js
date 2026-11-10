import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { sendContactMessage } from '../controllers/contactController.js'

// 5 messages per hour per visitor
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many messages sent. Please try again later.' },
})

const router = Router()

router.post('/', contactLimiter, sendContactMessage)

export default router