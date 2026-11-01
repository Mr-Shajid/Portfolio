import { ArrowUpRight, Download } from 'lucide-react'
import { site, githubUrl } from '../config/site'

function Hero() {
  const primaryButton =
    'inline-flex h-11 items-center justify-center rounded-md bg-fg px-6 text-sm font-medium text-bg transition-opacity hover:opacity-85'
  const secondaryButton =
    'inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line px-6 text-sm font-medium transition-colors hover:bg-surface'

  return (
    <section
      id="home"
      className="relative flex min-h-[80vh] scroll-mt-16 items-center border-b border-line py-20"
    >
      {/* Faint dotted grid. Decorative only, so hidden from screen readers. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(var(--line) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(to bottom, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
        }}
      />

      <div className="relative max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {site.eyebrow}
        </p>

        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {site.headline}
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-muted">{site.intro}</p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a href="#projects" className={primaryButton}>
            View Projects
          </a>

          {site.resumeAvailable ? (
            <a href={site.resumeFile} download className={secondaryButton}>
              <Download size={16} aria-hidden="true" />
              Download CV
            </a>
          ) : (
            <span
              aria-disabled="true"
              className={`${secondaryButton} cursor-not-allowed opacity-50 hover:bg-transparent`}
            >
              CV coming soon
            </span>
          )}

          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-1 px-2 text-sm text-muted transition-colors hover:text-fg"
          >
            GitHub
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero