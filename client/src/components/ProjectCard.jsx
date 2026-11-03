import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { isSafeUrl } from '../utils/safeUrl'

function ProjectCard({ project }) {
  // If the image fails to load, we hide it instead of showing a broken icon
  const [imageFailed, setImageFailed] = useState(false)

  const hasImage = isSafeUrl(project.imageUrl) && !imageFailed
  const hasCode = isSafeUrl(project.githubUrl)
  const hasDemo = isSafeUrl(project.liveUrl)

  const linkClass =
    'inline-flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70'
  const unavailableClass = 'text-sm text-muted'

  return (
    <article className="flex flex-col border border-line bg-bg p-6 transition-colors hover:border-fg">
      {hasImage && (
        <img
          src={project.imageUrl}
          alt={`Screenshot of ${project.title}`}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="mb-5 aspect-video w-full border border-line object-cover"
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {project.category}
        </p>
        {project.featured && (
          <span className="rounded-md border border-line px-2 py-0.5 font-mono text-xs text-muted">
            Featured
          </span>
        )}
      </div>

      <h3 className="mt-3 break-words text-lg font-semibold tracking-tight">
        {project.title}
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-muted">
        {project.description}
      </p>

      {project.problemStatement && (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          <span className="font-medium text-fg">Problem: </span>
          {project.problemStatement}
        </p>
      )}

      {project.features.length > 0 && (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted">
          {project.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      )}

      <ul className="mt-5 flex flex-wrap gap-2">
        {project.technologies.map((tech) => (
          <li
            key={tech}
            className="rounded-md border border-line px-2 py-0.5 font-mono text-xs text-muted"
          >
            {tech}
          </li>
        ))}
      </ul>

      {/* mt-auto pushes the links to the bottom so all cards line up */}
      <div className="mt-auto flex items-center gap-6 pt-6">
        {hasCode ? (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            View Code
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        ) : (
          <span className={unavailableClass}>Code unavailable</span>
        )}

        {hasDemo ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Live Demo
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        ) : (
          <span className={unavailableClass}>Demo unavailable</span>
        )}
      </div>
    </article>
  )
}

export default ProjectCard