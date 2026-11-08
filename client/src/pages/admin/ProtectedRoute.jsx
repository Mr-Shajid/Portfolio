import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function ProtectedRoute() {
  const { status } = useAuth()

  if (status === 'loading') {
    return <p className="p-6 text-sm text-muted">Checking session...</p>
  }
  if (status === 'out') {
    return <Navigate to="/admin/login" replace />
  }
  return <Outlet />
}

export default ProtectedRoute