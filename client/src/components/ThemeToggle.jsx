import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'

function ThemeToggle() {
  // Start from whatever the script in index.html already decided
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  )

  function toggleTheme() {
    const nextIsDark = !isDark
    document.documentElement.classList.toggle('dark', nextIsDark)

    // Remember the choice. Wrapped in try/catch because some browsers
    // block storage (for example in private mode).
    try {
      localStorage.setItem('theme', nextIsDark ? 'dark' : 'light')
    } catch {
      // Ignore: the theme still changes, it just won't be remembered.
    }

    setIsDark(nextIsDark)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-fg transition-colors hover:bg-surface"
    >
      {isDark ? (
        <Sun size={18} aria-hidden="true" />
      ) : (
        <Moon size={18} aria-hidden="true" />
      )}
    </button>
  )
}

export default ThemeToggle