import { createClient } from '@supabase/supabase-js'

// Configured via .env (see .env.example). When these are unset, the app falls
// back to mock sign-in so it still runs with no Supabase project.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = url && key ? createClient(url, key) : null
export const isSupabaseEnabled = Boolean(supabase)
