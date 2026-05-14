import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * RestrictionGuard.jsx — Global lockdown for banned/suspended users
 */
export default function RestrictionGuard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null

  // Determine restriction status
  const isBanned = user?.is_active === 0 || user?.org_status === 'rejected'
  const needsDocs = user?.org_status === 'more_docs_needed'
  const isRestricted = isAuthenticated && (isBanned || needsDocs)

  // If restricted and NOT already on the suspended page, redirect to it
  if (isRestricted && location.pathname !== '/suspended') {
    return <Navigate to="/suspended" replace />
  }

  // If NOT restricted but trying to access suspended page, go home
  if (!isRestricted && location.pathname === '/suspended' && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
