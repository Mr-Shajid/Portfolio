import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

function NotFound() {
  usePageTitle('Not Found | Md. Shahriar Chy Shajid ')

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm text-muted">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-fg px-6 text-sm font-medium text-bg transition-opacity hover:opacity-85"
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}

export default NotFound