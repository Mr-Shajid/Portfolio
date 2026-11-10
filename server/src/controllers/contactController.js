import { sendEmail } from '../utils/sendEmail.js'

// Turns anything into trimmed text, or '' if it was not text
function asText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

// Single-line fields must not contain line breaks or control characters
function oneLine(value) {
  return value.replace(/[\u0000-\u001F\u007F]+/g, ' ').trim()
}

// POST /api/contact
export async function sendContactMessage(req, res, next) {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {}

    // Hidden spam-trap field. Real visitors never fill it in.
    // We pretend it worked so bots don't learn anything, but send nothing.
    if (asText(body.website) !== '') {
      return res.json({ message: 'Message sent' })
    }

    const name = oneLine(asText(body.name))
    const email = oneLine(asText(body.email))
    const subject = oneLine(asText(body.subject))
    const message = asText(body.message)

    const errors = []
    if (name.length < 2 || name.length > 80) errors.push('Name must be 2 to 80 characters.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      errors.push('Please enter a valid email address.')
    }
    if (subject.length > 120) errors.push('Subject must be 120 characters or fewer.')
    if (message.length < 10 || message.length > 2000) {
      errors.push('Message must be 10 to 2000 characters.')
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(' '), details: errors })
    }

    const emailSubject = `Portfolio contact: ${subject || 'New message'}`.slice(0, 150)
    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject || '(none)'}`,
      '',
      message,
    ].join('\n')

    try {
      await sendEmail({ subject: emailSubject, text, replyTo: email })
    } catch (error) {
      if (error.code === 'EMAIL_NOT_CONFIGURED') {
        console.error('Contact form: email is not configured')
        return res.status(503).json({ message: 'The contact form is not available right now.' })
      }
      // Log the reason (status code only), then show a safe message
      console.error('Contact form: sending failed:', error.message)
      return res
        .status(502)
        .json({ message: 'Your message could not be sent. Please try again later.' })
    }

    res.json({ message: 'Message sent' })
  } catch (error) {
    next(error)
  }
}