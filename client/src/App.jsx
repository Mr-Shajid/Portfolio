import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import AdminRoot from './pages/admin/AdminRoot'
import AdminLogin from './pages/admin/AdminLogin'
import ProtectedRoute from './pages/admin/ProtectedRoute'
import AdminDashboard from './pages/admin/AdminDashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/admin" element={<AdminRoot />}>
        <Route path="login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App