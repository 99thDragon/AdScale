import { AuthProvider, useAuth } from './auth/AuthContext'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

// Decides what the signed-in user sees vs. the login screen.
function AppContent() {
  const { user, loading, signOut } = useAuth()

  if (loading) return null // brief flash-prevention while we restore the session

  if (!user) return <Login />

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-3">
        <span className="hidden text-sm text-slate-500 sm:inline">{user.email}</span>
        <button
          type="button"
          onClick={signOut}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>
      <Dashboard />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
