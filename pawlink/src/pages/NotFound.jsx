import { Link } from 'react-router-dom'

/**
 * NotFound.jsx — 404 Page
 * Route: * (catch-all)
 * Access: Public
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col text-center px-4">
      <p className="text-8xl mb-4">🐾</p>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">404 — Lost in the wild!</h1>
      <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">Go Back Home</Link>
    </div>
  )
}
