import { AuthProvider, useAuth } from './auth/AuthContext'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <Login />

  return <Dashboard />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
