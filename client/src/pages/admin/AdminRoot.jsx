import { Outlet } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthProvider'

function AdminRoot() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

export default AdminRoot