import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { listAdminProjects, updateAdminProject } from '../../api/adminProjects'

function AdminDashboard() {
  const { email, logout } = useAuth()
  const [projects, setProjects] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [message, setMessage] = useState('')
  const [busyId, setBusyId] = useState('')

  useEffect(() => {
    let cancelled = false

    listAdminProjects()
      .then((data) => {
        if (cancelled) return
        setProjects(data)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Flips "featured" or "published" for one project
  async function toggle(project, field) {
    setBusyId(project._id)
    setMessage('')
    try {
      const updated = await updateAdminProject(project._id, {
        [field]: !project[field],
      })
      setProjects((list) => list.map((p) => (p._id === updated._id ? updated : p)))
      setMessage(`Updated "${updated.title}".`)
    } catch (error) {
      if (error.status === 401) {
        await logout() // session expired: back to the login page
        return
      }
      setMessage(error.message)
    } finally {
      setBusyId('')
    }
  }

  const smallButton =
    'rounded-md border border-line px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted">Signed in as {email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-muted hover:text-fg">View site</Link>
          <button type="button" onClick={logout} className={smallButton}>
            Log out
          </button>
        </div>
      </header>

      <div className="mt-6" aria-live="polite">
        {message && <p className="mb-4 rounded-md border border-line p-3 text-sm">{message}</p>}

        {status === 'loading' && <p className="text-sm text-muted">Loading projects...</p>}
        {status === 'error' && (
          <p className="text-sm text-muted">Projects could not be loaded. Please refresh.</p>
        )}
        {status === 'ready' && projects.length === 0 && (
          <p className="text-sm text-muted">No projects yet.</p>
        )}

        {status === 'ready' && projects.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line font-mono text-xs uppercase tracking-widest text-muted">
                  <th className="py-3 pr-4 font-normal">Title</th>
                  <th className="py-3 pr-4 font-normal">Order</th>
                  <th className="py-3 pr-4 font-normal">Status</th>
                  <th className="py-3 pr-4 font-normal">Featured</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project._id} className="border-b border-line">
                    <td className="py-3 pr-4 font-medium">{project.title}</td>
                    <td className="py-3 pr-4 text-muted">{project.displayOrder}</td>
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        disabled={busyId === project._id}
                        onClick={() => toggle(project, 'published')}
                        className={smallButton}
                      >
                        {project.published ? 'Published (unpublish)' : 'Draft (publish)'}
                      </button>
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        disabled={busyId === project._id}
                        onClick={() => toggle(project, 'featured')}
                        className={smallButton}
                      >
                        {project.featured ? 'Yes (remove)' : 'No (feature)'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard