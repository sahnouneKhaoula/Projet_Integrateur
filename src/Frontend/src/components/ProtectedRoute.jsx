import { Navigate } from 'react-router-dom'

/**
 * Protège une route : JWT requis ; si `roles` est fourni, le rôle doit correspondre.
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/connexion" replace />
  }
  if (roles.length > 0) {
    try {
      const u = JSON.parse(localStorage.getItem('utilisateur') || 'null')
      if (!u?.role || !roles.includes(u.role)) {
        return <Navigate to="/" replace />
      }
    } catch {
      return <Navigate to="/connexion" replace />
    }
  }
  return children
}
