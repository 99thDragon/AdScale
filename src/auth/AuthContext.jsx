import { createContext, useContext, useEffect, useState } from 'react'

import { isSupabaseEnabled, supabase } from '../lib/supabaseClient'

/**
 * AuthContext — single source of truth for who is signed in.
 *
 * Per the PRD (section 6b), AdScale stores no passwords: auth is OAuth via the
 * user's Google / Meta account, brokered by Supabase Auth.
 *
 * - With Supabase configured (VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY),
 *   sign-in is a real OAuth redirect and the session is restored on return.
 * - Without it, we fall back to a localStorage mock so the UI still runs.
 *
 * Every component reads auth through `useAuth()`, so nothing else changes.
 */

const AuthContext = createContext(null)
const STORAGE_KEY = 'adscale.auth.user'

/** Normalize a Supabase session into the small user shape the UI expects. */
function toUser(session) {
  const u = session?.user
  if (!u) return null
  const meta = u.user_metadata ?? {}
  return {
    name: meta.full_name ?? meta.name ?? u.email,
    email: u.email,
    provider: u.app_metadata?.provider ?? 'supabase',
    avatar: meta.avatar_url ?? null,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isSupabaseEnabled) {
      // Restore the current session, then keep it in sync (covers the OAuth
      // redirect back from Google/Meta and sign-out in other tabs).
      supabase.auth.getSession().then(({ data }) => {
        setUser(toUser(data.session))
        setLoading(false)
      })
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(toUser(session))
      })
      return () => sub.subscription.unsubscribe()
    }

    // Mock fallback.
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setUser(JSON.parse(saved))
    } catch {
      // Ignore corrupt/inaccessible storage and start signed out.
    }
    setLoading(false)
  }, [])

  function persistMock(nextUser) {
    setUser(nextUser)
    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  async function signInWith(provider, mockUser) {
    if (isSupabaseEnabled) {
      // Redirects to the provider; onAuthStateChange sets the user on return.
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      })
      return
    }
    persistMock(mockUser)
  }

  const signInWithGoogle = () =>
    signInWith('google', { name: 'Google Advertiser', email: 'manager@gmail.com', provider: 'google' })

  const signInWithMeta = () =>
    signInWith('facebook', { name: 'Meta Advertiser', email: 'manager@business.fb', provider: 'meta' })

  async function signOut() {
    if (isSupabaseEnabled) {
      await supabase.auth.signOut()
      setUser(null)
      return
    }
    persistMock(null)
  }

  const value = { user, loading, signInWithGoogle, signInWithMeta, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
