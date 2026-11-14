import { useEffect } from 'react'

// Sets the browser tab title while a page is shown, then restores the old one
export function usePageTitle(title) {
  useEffect(() => {
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}