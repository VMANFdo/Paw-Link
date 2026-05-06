import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Navbar.jsx — Top Navigation Bar
 *
 * WHY: Global navigation rendered on every page via AppRouter.jsx.
 * Adapts based on auth state — shows different links for
 * logged-out users vs logged-in users vs admins.
 *
 * Features:
 *  - Responsive (hamburger menu on mobile)
 *  - Active link highlighting
 *  - User dropdown menu
 */

const navLinks = [
  { to: '/animals', label: 'Browse Animals' },
  { to: '/map',     label: 'Map' },
  { to: '/about',   label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate  = useNavigate()
  const [isOpen, setIsOpen]         = useState(false)  // mobile menu
  const [dropdownOpen, setDropdown] = useState(false)  // user dropdown

  const handleLogout = () => {
    logout()
    navigate('/')
    setDropdown(false)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container-section">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-primary-600">
            <span className="text-2xl">🐾</span>
            <span>PawLink</span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-primary-600 font-semibold'
                      : 'text-gray-600 hover:text-primary-500'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* ── Auth Section ── */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                {/* User avatar button */}
                <button
                  id="user-menu-btn"
                  onClick={() => setDropdown(!dropdownOpen)}
                  className="flex items-center gap-2 bg-primary-50 hover:bg-primary-100 rounded-xl px-3 py-2 transition-colors"
                >
                  <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link to="/dashboard" onClick={() => setDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50">My Dashboard</Link>
                    <Link to="/profile" onClick={() => setDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50">Profile</Link>
                    <Link to="/add-animal" onClick={() => setDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50">Post an Animal</Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50">Admin Panel</Link>
                    )}
                    {(user?.role === 'shelter' || user?.role === 'admin') && (
                      <Link to="/shelter-dashboard" onClick={() => setDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50">Shelter Dashboard</Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"    className="text-sm font-medium text-gray-600 hover:text-primary-500 transition-colors">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            id="mobile-menu-btn"
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {isOpen && (
          <nav className="md:hidden border-t border-gray-100 py-3 flex flex-col gap-1">
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <hr className="my-2 border-gray-100" />
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="px-3 py-2 text-sm text-gray-700">Dashboard</Link>
                <button onClick={() => { handleLogout(); setIsOpen(false) }}
                  className="px-3 py-2 text-sm text-red-500 text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"    onClick={() => setIsOpen(false)} className="px-3 py-2 text-sm text-gray-700">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="px-3 py-2 text-sm text-primary-600 font-semibold">Register</Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
