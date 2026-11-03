import { useEffect, useState } from 'react'
import SectionHeading from './SectionHeading'
import ProjectCard from './ProjectCard'
import { getProjects } from '../api/projects'

function Projects() {
  const [projects, setProjects] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getProjects()
        if (cancelled) return
        // Sort by displayOrder so you control the order from the dashboard later
        const sorted = [...data].sort((a, b) => a.displayOrder - b.displayOrder)
        setProjects(sorted)
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    load()

    // Cleanup: if the page leaves before the data arrives, ignore the result
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="projects" className="scroll-mt-16 border-b border-line py-24">
      <SectionHeading label="Projects" title="Selected work" />

      <div className="mt-10" aria-live="polite">
        {status === 'loading' && (
          <p className="text-sm text-muted">Loading projects...</p>
        )}

        {status === 'error' && (
          <p className="text-sm text-muted">
            Projects could not be loaded right now. Please try again later.
          </p>
        )}

        {status === 'ready' && projects.length === 0 && (
          <p className="text-sm text-muted">No projects have been added yet.</p>
        )}

        {status === 'ready' && projects.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Projects