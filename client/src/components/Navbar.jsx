import { useState, useEffect } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { site, githubUrl } from '../config/site'


function Navbar() {
  // Controls whether the mobile menu is open
  const [menuOpen, setMenuOpen] = useState(false)

    // Pressing Escape closes the open mobile menu
  useEffect(() => {
    if (!menuOpen) return

    function onKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const linkClass = 'text-sm text-muted transition-colors hover:text-fg'

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6"
      >
        <a href="#home" className="text-sm font-semibold tracking-tight sm:text-base">
          {site.name}
        </a>

        {/* Desktop links (hidden on small screens) */}
        <ul className="hidden items-center gap-8 md:flex">
          {site.navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={linkClass}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkClass} mr-2 hidden items-center gap-1 md:inline-flex`}
          >
            GitHub
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>

          <ThemeToggle />

          {/* Menu button (only on small screens) */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-fg transition-colors hover:bg-surface md:hidden"
          >
            {menuOpen ? (
              <X size={18} aria-hidden="true" />
            ) : (
              <Menu size={18} aria-hidden="true" />
            )}
          </button>                
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <ul id="mobile-menu" className="border-t border-line px-6 py-2 md:hidden">
          {site.navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-sm text-muted hover:text-fg"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-3 text-sm text-muted hover:text-fg"
            >
              GitHub
            </a>
          </li>
        </ul>
      )}
    </header>
  )
}

export default Navbar