import { Outlet } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthProvider'
import { usePageTitle } from '../../hooks/usePageTitle'

function AdminRoot() {
  usePageTitle('Admin | Md. Shahriar Chy Shajid')

  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

export default AdminRoot