import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useUI } from '../../context/UIContext'
import { userService } from '../../services/userService'

/**
 * Navbar.jsx — Top Navigation Bar
 * Features responsive layout, auth-aware links, a theme toggle, and a user dropdown.
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
  const { theme, toggleTheme } = useUI()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

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
    <header className="bg-white dark:bg-dark-800 border-b border-gray-100 dark:border-gray-800/50 sticky top-0 z-[1000] shadow-sm transition-colors duration-200">
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
          {(user?.role !== 'organization' || user?.org_status === 'approved') && navLinks.map(link => (
            <NavLink 
              key={link.to} 
              to={link.to}
              className={({ isActive }) => 
                `text-sm font-bold transition-colors ${
                  isActive 
                    ? 'text-primary-600 dark:text-primary-500' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          
          {/* Org-only Nav Link */}
          {user?.role === 'organization' && user?.org_status === 'approved' && (
            <NavLink 
              to="/manage-animals"
              className={({ isActive }) => 
                `text-sm font-bold transition-colors ${
                  isActive 
                    ? 'text-primary-600 dark:text-primary-500' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400'
                }`
              }
            >
              Manage Animals
            </NavLink>
          )}
          
          {/* Admin-only Nav Link */}
          {user?.role === 'admin' && (
            <>
              <NavLink 
                to="/admin"
                state={{ tab: 'stats' }}
                className={({ isActive }) => 
                  `text-sm font-black transition-colors px-3 py-1 rounded-lg ${
                    isActive && (!location.state || (location.state.tab !== 'manage_orgs' && location.state.tab !== 'reports')) 
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' 
                      : 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
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
                    isActive && location.state?.tab === 'manage_orgs' 
                      ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400' 
                      : 'text-primary-500 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/20'
                  }`
                }
              >
                🏢 Manage Organizations
              </NavLink>
              <NavLink 
                to="/admin"
                state={{ tab: 'reports' }}
                className={({ isActive }) => 
                  `text-sm font-black transition-colors px-3 py-1 rounded-lg ${
                    isActive && location.state?.tab === 'reports' 
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' 
                      : 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
                  }`
                }
              >
                🚩 Reported Posts
              </NavLink>
            </>
          )}
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-900/50 text-gray-500 dark:text-gray-400 transition-all duration-200"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5 animate-pulse text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/messages" className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors p-1 relative" title="Inquiries & Messages">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-dark-800">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 bg-gray-50 dark:bg-dark-900 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-900/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold uppercase overflow-hidden">
                    {user.profile_picture ? (
                      <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{user.name.split(' ')[0]}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-0" onClick={() => setDropdownOpen(false)}></div>
                    <div className="absolute right-0 w-48 mt-2 py-2 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800/40 z-10 animate-fade-in-up">
                      <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-750/50 mb-2">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Signed in as</p>
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user.email}</p>
                      </div>
                      {user.role !== 'admin' && (user.role !== 'organization' || user.org_status === 'approved') && (
                        <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-950/20 font-medium">Dashboard</Link>
                      )}
                      {(user.role !== 'organization' || user.org_status === 'approved') && (
                        <Link to="/profile" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-950/20 font-medium">Profile</Link>
                      )}
                      {user.role === 'admin' && (
                        <>
                          <Link 
                            to="/admin" 
                            state={{ tab: 'manage_orgs' }}
                            onClick={() => setDropdownOpen(false)} 
                            className="block px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/20 font-bold"
                          >
                            Manage Organizations
                          </Link>
                          <Link 
                            to="/admin" 
                            state={{ tab: 'reports' }}
                            onClick={() => setDropdownOpen(false)} 
                            className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold"
                          >
                            Reported Posts
                          </Link>
                        </>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-medium"
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
              <Link to="/login" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">Login</Link>
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
        <div className="md:hidden bg-white dark:bg-dark-800 border-t border-gray-50 dark:border-gray-800/50 p-4 space-y-4 animate-fade-in transition-colors duration-200">
          {(user?.role !== 'organization' || user?.org_status === 'approved') && navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)} className="block text-gray-700 dark:text-gray-300 font-bold px-2 py-1 hover:text-primary-500 dark:hover:text-primary-400">
              {link.label}
            </Link>
          ))}
          {user?.role === 'organization' && user?.org_status === 'approved' && (
            <Link to="/manage-animals" onClick={() => setIsOpen(false)} className="block text-gray-700 dark:text-gray-300 font-bold px-2 py-1 hover:text-primary-500 dark:hover:text-primary-400">
              Manage Animals
            </Link>
          )}
          <hr className="border-gray-50 dark:border-gray-750/50" />
          
          {user ? (
            <>
              {(user.role !== 'organization' || user.org_status === 'approved') && (
                <>
                  <Link to="/messages" onClick={() => setIsOpen(false)} className="block text-gray-700 dark:text-gray-300 font-bold px-2 py-1 hover:text-primary-500 dark:hover:text-primary-400">Inquiries / Messages</Link>
                  {user.role !== 'admin' && (
                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-gray-700 dark:text-gray-300 font-bold px-2 py-1 hover:text-primary-500 dark:hover:text-primary-400">Dashboard</Link>
                  )}
                </>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-red-600 dark:text-red-400 font-black px-2 py-1">🛡️ Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="block text-red-500 dark:text-red-400 font-bold px-2 py-1 text-left w-full">Sign Out</button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center text-gray-600 dark:text-gray-300 font-bold">Login</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary text-center">Register</Link>
            </div>
          )}

          {/* Mobile Theme Switcher */}
          <div className="flex items-center justify-between px-2 py-2 border-t border-gray-50 dark:border-gray-800/50 pt-4">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Theme</span>
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-700 text-gray-750 dark:text-gray-300 font-bold text-sm"
            >
              {theme === 'dark' ? (
                <>
                  <span className="text-yellow-450">☀️</span> Light Mode
                </>
              ) : (
                <>
                  <span className="text-gray-500">🌙</span> Dark Mode
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
