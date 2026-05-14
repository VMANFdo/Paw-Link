import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { userService } from '../../services/userService'

/**
 * Navbar.jsx — Top Navigation Bar
 * Features responsive layout, auth-aware links, and a user dropdown.
 */

const navLinks = [
  { to: '/animals',  label: 'Browse Animals' },
  { to: '/map',      label: 'Map' },
  { to: '/shelters', label: 'Shelters' },
  { to: '/about',    label: 'About' },
  { to: '/contact',  label: 'Contact' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

  useEffect(() => {
    if (user) {
      userService.getUnreadCount()
        .then(res => setUnreadCount(res.data.data.totalUnread))
        .catch(err => console.error('Failed to fetch unread count', err))
    } else {
      setUnreadCount(0)
    }
  }, [user, location.pathname])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    setIsOpen(false)
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-[1000] shadow-sm">
      <div className="container h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img 
            src="/logo.png" 
            alt="PawLink Logo" 
            className="h-14 w-auto group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map(link => (
            <NavLink 
              key={link.to} 
              to={link.to}
              className={({ isActive }) => 
                `text-sm font-bold transition-colors ${
                  isActive ? 'text-primary-600' : 'text-gray-500 hover:text-primary-500'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          
          {/* Admin-only Nav Link */}
          {user?.role === 'admin' && (
            <>
              <NavLink 
                to="/admin"
                state={{ tab: 'stats' }}
                className={({ isActive }) => 
                  `text-sm font-black transition-colors px-3 py-1 rounded-lg ${
                    isActive && (!location.state || location.state.tab !== 'manage_orgs') ? 'bg-red-50 text-red-600' : 'text-red-500 hover:bg-red-50'
                  }`
                }
              >
                🛡️ Admin Panel
              </NavLink>
              <NavLink 
                to="/admin"
                state={{ tab: 'manage_orgs' }}
                className={({ isActive }) => 
                  `text-sm font-black transition-colors px-3 py-1 rounded-lg ${
                    isActive && location.state?.tab === 'manage_orgs' ? 'bg-primary-50 text-primary-600' : 'text-primary-500 hover:bg-primary-50'
                  }`
                }
              >
                🏢 Manage Organizations
              </NavLink>
            </>
          )}
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/messages" className="text-gray-400 hover:text-primary-500 transition-colors p-1 relative" title="Inquiries & Messages">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold uppercase overflow-hidden">
                  {user.profile_picture ? (
                    <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <span className="text-sm font-bold text-gray-700">{user.name.split(' ')[0]}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-0" onClick={() => setDropdownOpen(false)}></div>
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-10 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-gray-50 mb-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Signed in as</p>
                      <p className="text-xs font-bold text-gray-900 truncate">{user.email}</p>
                    </div>
                    {user.role !== 'admin' && (
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 font-medium">Dashboard</Link>
                    )}
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 font-medium">Profile</Link>
                    {user.role === 'organization' && (
                      <Link to="/org-dashboard" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 font-bold">Org Dashboard</Link>
                    )}
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        state={{ tab: 'manage_orgs' }}
                        onClick={() => setDropdownOpen(false)} 
                        className="block px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 font-bold"
                      >
                        Manage Organizations
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-red-500 font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-primary-600">Login</Link>
              <Link to="/register" className="btn-primary px-6 py-2 rounded-full text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-500 p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-50 p-4 space-y-4 animate-fade-in">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)} className="block text-gray-700 font-bold px-2 py-1">
              {link.label}
            </Link>
          ))}
          <hr className="border-gray-50" />
          {user ? (
            <>
              <Link to="/messages" onClick={() => setIsOpen(false)} className="block text-gray-700 font-bold px-2 py-1">Inquiries / Messages</Link>
              {user.role !== 'admin' && (
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-gray-700 font-bold px-2 py-1">Dashboard</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-red-600 font-black px-2 py-1">🛡️ Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="block text-red-500 font-bold px-2 py-1">Sign Out</button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center text-gray-600 font-bold">Login</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary text-center">Register</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
