import { supabase } from './supabaseClient'

/**
 * Future schema reference (Supabase):
 * table: profiles
 * columns:
 * - id uuid primary key
 * - user_id uuid
 * - display_name text
 * - payload jsonb
 * - updated_at timestamp
 */

export async function saveCloudProfile(userId, payload) {
  if (!supabase || !userId) return { data: null, error: null }

  // TODO: Add robust merge/conflict strategy before enabling full cloud sync writes.
  // TODO: Add RLS policies tied to auth.uid() and protect per-user profile records.
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        display_name: payload?.userName ?? null,
        payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select()
    .maybeSingle()

  return { data, error }
}

export async function loadCloudProfile(userId) {
  if (!supabase || !userId) return { data: null, error: null }

  // TODO: Once conflict policy is finalized, hydrate local profile state from this payload.
  const { data, error } = await supabase
    .from('profiles')
    .select('payload, display_name, updated_at')
    .eq('user_id', userId)
    .maybeSingle()

  return { data, error }
}

