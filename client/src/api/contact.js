const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function sendContactMessage(data) {
  const response = await fetch(`${API_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    // Use the server's message if it sent one, otherwise a safe default
    let message = 'Your message could not be sent. Please try again later.'
    try {
      const body = await response.json()
      if (body.message) message = body.message
    } catch {
      // The response was not JSON. Keep the default message.
    }
    throw new Error(message)
  }
}