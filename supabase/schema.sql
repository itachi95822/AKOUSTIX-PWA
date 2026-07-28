-- ============================================================
-- AKOUSTIX — Supabase setup: songs RLS + music storage bucket
--
-- Run once in the Supabase Dashboard → SQL Editor.
-- Idempotent: safe to re-run.
--
-- What this does:
--   1. Ensures the `songs` table has optional track_no/year columns
--   2. Enables Row Level Security on `songs`
--   3. Grants public READ-ONLY access (SELECT) to the songs table
--   4. Creates a public `music` storage bucket for audio + cover art
--   5. Grants public READ access to objects in the `music` bucket
--
-- The app uses ONLY the publishable (anon) key — protected by these
-- policies. No service role key is ever exposed to the client.
-- ============================================================

-- -------------------------------------------------------
-- 1. Optional columns on the existing `songs` table
--    (the table already exists with id, title, artist, album,
--     duration, cover_url, music_url)
-- -------------------------------------------------------
alter table public.songs
  add column if not exists track_no int,
  add column if not exists year int;

-- -------------------------------------------------------
-- 2. Enable Row Level Security on songs
-- -------------------------------------------------------
alter table public.songs enable row level security;

-- -------------------------------------------------------
-- 3. Read-only policy for songs (anon + authenticated)
--    Anyone with the publishable key can READ songs.
--    No INSERT/UPDATE/DELETE is granted from the client.
-- -------------------------------------------------------
drop policy if exists "songs public read" on public.songs;
create policy "songs public read"
  on public.songs
  for select
  to anon, authenticated
  using (true);

-- (Optional) deny client-side writes explicitly — RLS defaults to
-- deny when no policy matches, so this is belt-and-suspenders.
drop policy if exists "songs no client writes" on public.songs;
-- No INSERT/UPDATE/DELETE policy => writes are denied by RLS.

-- -------------------------------------------------------
-- 4. Create the `music` storage bucket (public = readable via
--    public URLs without an authenticated session)
-- -------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('music', 'music', true)
on conflict (id) do nothing;

-- -------------------------------------------------------
-- 5. Public READ policy for objects in the `music` bucket
--    (audio files + cover art). No write policy => uploads
--    require the service role key (server-side only).
-- -------------------------------------------------------
drop policy if exists "music bucket public read" on storage.objects;
create policy "music bucket public read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'music');

-- Done. The app can now:
--   * GET /rest/v1/songs           → list + search songs (read-only)
--   * GET /storage/v1/object/public/music/<path> → stream audio / show cover art
