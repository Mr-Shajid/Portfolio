// Sends one email through Resend's HTTP API (no extra library needed).
export async function sendEmail({ subject, text, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from =
    process.env.CONTACT_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>'

  if (!apiKey || !to) {
    const error = new Error('Email is not configured')
    error.code = 'EMAIL_NOT_CONFIGURED'
    throw error
  }

  // Give up after 10 seconds
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, text, reply_to: replyTo }),
      signal: controller.signal,
    })

    if (!response.ok) {
      // Only the status code is reported. Never the key or the message.
      throw new Error(`Email provider responded with status ${response.status}`)
    }
  } finally {
    clearTimeout(timer)
  }
}