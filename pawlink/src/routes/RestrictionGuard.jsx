import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * RestrictionGuard.jsx — Global lockdown for banned/suspended users
 */
export default function RestrictionGuard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null

  if (isAuthenticated) {
    // 1. User ban
    if (user?.is_active === 0) {
      if (location.pathname !== '/suspended') {
        return <Navigate to="/suspended" replace />
      }
      return <Outlet />
    }

    // 2. Organization Onboarding Status
    if (user?.role === 'organization') {
      const isComplete = user?.org_profile_complete === 1
      const status = user?.org_status // 'pending', 'approved', 'rejected', 'more_docs_needed'

      // Profile Setup Step
      if (!isComplete) {
        if (location.pathname !== '/org-setup') {
          return <Navigate to="/org-setup" replace />
        }
        return <Outlet />
      }

      // Admin Approval Step
      if (status !== 'approved') {
        if (location.pathname !== '/org-pending') {
          return <Navigate to="/org-pending" replace />
        }
        return <Outlet />
      }
    }
  }

  // Prevent restricted/complete users from sitting on setup/suspended/pending paths
  if (isAuthenticated) {
    const isSetupDoneOrgOnSetup = location.pathname === '/org-setup' && user?.role === 'organization' && user?.org_profile_complete === 1
    const isNormalUserOnPending = location.pathname === '/org-pending' && user?.role !== 'organization'
    const isApprovedOrgOnPending = location.pathname === '/org-pending' && user?.role === 'organization' && user?.org_status === 'approved'
    const isNotBannedOnSuspended = location.pathname === '/suspended' && user?.is_active !== 0 && (user?.role !== 'organization' || user?.org_status === 'approved')

    if (isApprovedOrgOnPending) {
      return <Navigate to="/profile" replace />
    }

    if (isSetupDoneOrgOnSetup) {
      return <Navigate to="/org-pending" replace />
    }

    if (isNormalUserOnPending) {
      return <Navigate to="/dashboard" replace />
    }

    if (isNotBannedOnSuspended) {
      const target = user?.role === 'organization' ? '/profile' : user?.role === 'admin' ? '/admin' : '/dashboard'
      return <Navigate to={target} replace />
    }
  }

  return <Outlet />
}
