import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ============================================================
// Supabase client — the single shared connection.
//
// Uses the client-safe PUBLISHABLE (anon) key only, protected
// by Row Level Security. The service role key (sb_secret_...)
// is NEVER referenced in the app — it stays server-side.
//
// Config is read from Vite env vars (.env, gitignored). If the
// vars are absent, `supabase` is null and the app shows an error
// state instead of loading songs.
// ============================================================

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true } }) : null

export const supabaseReady = Boolean(supabase)

/** Resolve a storage path or full URL to a playable/displayable public URL. */
export function resolvePublicUrl(bucket: string, pathOrUrl: string | null | undefined): string | undefined {
  if (!pathOrUrl) return undefined
  // Already a full URL — use as-is.
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  if (!supabase) return undefined
  return supabase.storage.from(bucket).getPublicUrl(pathOrUrl).data.publicUrl
}
