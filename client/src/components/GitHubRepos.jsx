import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { getGithubRepos } from '../api/github'
import { githubUrl } from '../config/site'
import { isSafeUrl } from '../utils/safeUrl'

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en', { year: 'numeric', month: 'short' })
}

function GitHubRepos() {
  const [repos, setRepos] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready

  useEffect(() => {
    let cancelled = false

    getGithubRepos()
      .then((data) => {
        if (cancelled) return
        setRepos(data)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mt-16">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-semibold tracking-tight">More on GitHub</h3>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-fg"
        >
          All repositories
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>

      <div className="mt-6" aria-live="polite">
        {status === 'loading' && (
          <p className="text-sm text-muted">Loading repositories...</p>
        )}

        {status === 'error' && (
          <p className="text-sm text-muted">
            Repositories could not be loaded right now. You can browse them on my GitHub profile.
          </p>
        )}

        {status === 'ready' && repos.length === 0 && (
          <p className="text-sm text-muted">No public repositories to show yet.</p>
        )}

        {status === 'ready' && repos.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {repos.map((repo) => (
              <li key={repo.id} className="border border-line p-4">
                {isSafeUrl(repo.url) ? (
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-words text-sm font-medium hover:underline"
                  >
                    {repo.name}
                  </a>
                ) : (
                  <span className="break-words text-sm font-medium">{repo.name}</span>
                )}

                <p className="mt-2 text-sm text-muted">
                  {repo.description || 'No description provided.'}
                </p>

                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted">
                  {repo.language && <span>{repo.language}</span>}
                  {repo.stars > 0 && <span>{repo.stars} stars</span>}
                  {formatDate(repo.updatedAt) && (
                    <span>Updated {formatDate(repo.updatedAt)}</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default GitHubRepos