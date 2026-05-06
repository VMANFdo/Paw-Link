import { useAuth } from '../context/AuthContext'

/**
 * Dashboard.jsx — User Dashboard
 * Route: /dashboard
 * Access: Private
 */
export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="container-section py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">My Dashboard</h1>
      <p className="text-gray-500 mb-6">Welcome back, <strong>{user?.name}</strong>!</p>
      <p className="text-gray-400">Dashboard content coming in Phase 5...</p>
    </div>
  )
}
