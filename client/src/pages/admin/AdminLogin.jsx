import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function AdminLogin() {
  const { status, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  // Already logged in? Go straight to the dashboard
  if (status === 'in') return <Navigate to="/admin" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setSending(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(
        err instanceof TypeError
          ? 'Could not reach the server. Please try again later.'
          : err.message
      )
      setSending(false)
    }
  }

  const inputClass =
    'w-full rounded-md border border-line bg-bg px-3 py-2.5 text-sm text-fg'

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Admin</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Sign in</h1>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email" type="email" autoComplete="username"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className={`${inputClass} mt-2`}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input
              id="password" type="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} mt-2`}
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-fg px-6 text-sm font-medium text-bg transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? 'Signing in...' : 'Sign in'}
          </button>

          <div aria-live="polite">
            {error && (
              <p role="alert" className="rounded-md border border-fg p-3 text-sm">
                {error}
              </p>
            )}
          </div>
        </form>

        <Link to="/" className="mt-8 inline-block text-sm text-muted hover:text-fg">
          Back to site
        </Link>
      </div>
    </main>
  )
}

export default AdminLogin