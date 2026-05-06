import AppRouter from './routes/AppRouter'
import { AuthProvider } from './context/AuthContext'

/**
 * App.jsx — Root component
 *
 * WHY: This is the top-level React component. It wraps the entire application
 * with the AuthProvider (so every page/component can access auth state)
 * and renders the AppRouter (which manages all navigation).
 */
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App
