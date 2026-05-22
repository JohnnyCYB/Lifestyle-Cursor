import { isSupabaseConfigured, supabase } from './supabaseClient'

export function isAuthEnabled() {
  return isSupabaseConfigured() && Boolean(supabase)
}

export async function getCurrentUser() {
  if (!isAuthEnabled()) return null
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data?.user ?? null
}

export async function signUpWithEmail(email, password, displayName) {
  if (!isAuthEnabled()) return { user: null, error: new Error('Supabase auth is not configured.') }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName?.trim() || '' },
    },
  })
  return { user: data?.user ?? null, error: error ?? null }
}

export async function signInWithEmail(email, password) {
  if (!isAuthEnabled()) return { user: null, error: new Error('Supabase auth is not configured.') }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { user: data?.user ?? null, error: error ?? null }
}

export async function signOut() {
  if (!isAuthEnabled()) return { error: null }
  const { error } = await supabase.auth.signOut()
  return { error: error ?? null }
}

// TODO: Add Google OAuth flow (supabase.auth.signInWithOAuth({ provider: 'google' })).
// TODO: Add auth state subscription + token refresh handling in a dedicated auth context.

