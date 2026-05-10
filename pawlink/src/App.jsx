import AppRouter from './routes/AppRouter'
import { AuthProvider } from './context/AuthContext'
import { UIProvider } from './context/UIContext'

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <AppRouter />
      </UIProvider>
    </AuthProvider>
  )
}

export default App
