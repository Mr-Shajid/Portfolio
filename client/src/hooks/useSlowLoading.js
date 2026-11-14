import { useEffect, useState } from 'react'

// Becomes true if loading is still going after delayMs milliseconds
export function useSlowLoading(isLoading, delayMs = 4000) {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    if (!isLoading) return
    const timer = setTimeout(() => setSlow(true), delayMs)
    return () => {
      clearTimeout(timer)
      setSlow(false)
    }
  }, [isLoading, delayMs])

  return slow && isLoading
}