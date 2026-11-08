import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import { apiRequest, clearCsrfToken } from '../api/client'

export function AuthProvider({ children }) {
  // status is "loading" until we know, then "in" or "out"
  const [state, setState] = useState({ status: 'loading', email: '' })

  // On first load, ask the server whether our cookie is a valid login
  useEffect(() => {
    let cancelled = false

    apiRequest('/api/auth/me')
      .then((data) => {
        if (!cancelled) setState({ status: 'in', email: data.email })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'out', email: '' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    clearCsrfToken() // login replaced the session, so the old token is invalid
    setState({ status: 'in', email: data.email })
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' })
    } catch {
      // Even if the server call fails, we treat the browser as logged out
    }
    clearCsrfToken()
    setState({ status: 'out', email: '' })
  }, [])

  const value = useMemo(() => ({ ...state, login, logout }), [state, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}