import { createContext, useContext, useEffect, useState } from 'react'

/**
 * AuthContext — single source of truth for who is signed in.
 *
 * Per the PRD (section 6b, Data Minimization), AdScale does NOT store
 * usernames or passwords. Authentication is OAuth-based: the user signs in by
 * connecting their Google or Meta ad account. For the MVP this provider uses a
 * mock sign-in persisted to localStorage so the UI can be built before the
 * backend exists — mirroring how the dashboard was built static-first.
 *
 * TO GO LIVE: replace the bodies of `signInWithGoogle` / `signInWithMeta` with
 * a real OAuth call, e.g. Supabase:
 *
 *   await supabase.auth.signInWithOAuth({ provider: 'google' })
 *
 * Nothing else in the app needs to change — every component reads auth through
 * the `useAuth()` hook.
 */

const AuthContext = createContext(null)

const STORAGE_KEY = 'adscale.auth.user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore any existing session on first load.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setUser(JSON.parse(saved))
    } catch {
      // Ignore corrupt/inaccessible storage and start signed out.
    }
    setLoading(false)
  }, [])

  function persist(nextUser) {
    setUser(nextUser)
    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // --- OAuth seam -----------------------------------------------------------
  // MOCK stand-ins for the real OAuth redirect. Swap these two functions for
  // Supabase / Google / Meta OAuth when the backend is ready; the rest of the
  // app is already wired to them.
  async function signInWithGoogle() {
    persist({ name: 'Google Advertiser', email: 'manager@gmail.com', provider: 'google' })
  }

  async function signInWithMeta() {
    persist({ name: 'Meta Advertiser', email: 'manager@business.fb', provider: 'meta' })
  }
  // -------------------------------------------------------------------------

  function signOut() {
    persist(null)
  }

  const value = { user, loading, signInWithGoogle, signInWithMeta, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
