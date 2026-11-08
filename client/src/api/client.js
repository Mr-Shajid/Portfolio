const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// The CSRF token is kept in memory only. We never store it anywhere permanent.
let csrfToken = null

async function getCsrfToken() {
  if (csrfToken) return csrfToken

  const response = await fetch(`${API_URL}/api/auth/csrf-token`, {
    credentials: 'include', // sends and receives the session cookie
  })
  if (!response.ok) throw new Error('Could not start a secure session')

  const body = await response.json()
  csrfToken = body.token
  return csrfToken
}

// Call after login and logout, because those create a new session
export function clearCsrfToken() {
  csrfToken = null
}

export async function apiRequest(path, { method = 'GET', body } = {}, retried = false) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (method !== 'GET') headers['X-CSRF-Token'] = await getCsrfToken()

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let data = null
  try {
    data = await response.json()
  } catch {
    // The response had no JSON body.
  }

  // A stale token (for example after the session expired): get a new one, retry once
  if (response.status === 403 && method !== 'GET' && !retried) {
    clearCsrfToken()
    return apiRequest(path, { method, body }, true)
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed')
    error.status = response.status
    error.details = data?.details
    throw error
  }

  return data
}