import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute.jsx — Route Guard Component
 *
 * WHY: React Router v6 uses layout routes for auth guards.
 * This component checks:
 *  1. Is the user logged in? (redirect to /login if not)
 *  2. Does the user have the required role? (redirect to / if not)
 *
 * Usage in AppRouter.jsx:
 *  <Route element={<ProtectedRoute />}>
 *    ... protected child routes
 *  </Route>
 *
 *  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
 *    ... admin-only routes
 *  </Route>
 *
 * @param {string[]} allowedRoles - Optional. If provided, only these roles can access.
 */

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, isLoading } = useAuth()

  // While checking saved token on mount, show nothing (avoids flash redirect)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Logged in but wrong role → go to home
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  // All checks passed → render child routes
  return <Outlet />
}
