import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps a route so only authenticated users can access it.
 * Pass `roles={['admin']}` to restrict by role.
 */
export default function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="spinner-wrap" style={{ paddingTop:'40vh' }}><div className="spinner" /></div>

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    // Redirect to their home based on role
    if (user.role === 'admin')    return <Navigate to="/admin" replace />
    if (user.role === 'provider') return <Navigate to="/provider" replace />
    return <Navigate to="/seeker" replace />
  }

  return children
}
