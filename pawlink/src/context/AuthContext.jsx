import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

/**
 * AuthContext — Global Authentication State
 *
 * WHY: We use React Context so that any component in the app
 * (Navbar, ProtectedRoute, Dashboard, etc.) can read the current
 * user's info and auth status WITHOUT passing props through every level.
 *
 * Provides:
 *  - user         : the logged-in user object (or null)
 *  - token        : JWT token string (or null)
 *  - isLoading    : true while checking for saved token on mount
 *  - login(data)  : saves token + user to state and localStorage
 *  - logout()     : clears state and localStorage
 *  - isAuthenticated : boolean shortcut
 */

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // On app load: check if a token is saved from a previous session
  useEffect(() => {
    const savedToken = localStorage.getItem('pawlink_token')
    const savedUser  = localStorage.getItem('pawlink_user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }

    setIsLoading(false)
  }, [])

  /**
   * login() — Called after successful API login
   * @param {object} data - { token, user } from the API response
   */
  const login = (data) => {
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('pawlink_token', data.token)
    localStorage.setItem('pawlink_user', JSON.stringify(data.user))
  }

  /**
   * logout() — Clears everything
   */
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('pawlink_token')
    localStorage.removeItem('pawlink_user')
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('pawlink_user', JSON.stringify(userData))
  }

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth() — Custom hook for consuming AuthContext
 * Usage: const { user, login, logout, isAuthenticated } = useAuth()
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>')
  }
  return context
}

export default AuthContext
