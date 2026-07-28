import type { Album, Artist, Playlist, Song } from '@/types'
import { library } from '@/data/library'
import { resolvePublicUrl, supabase } from './supabaseClient'

// ============================================================
// SupabaseService — reads the music catalog from Supabase.
//
// Reads only from the `songs` table (RLS: public read-only) and
// resolves audio + cover art URLs from the `music` storage
// bucket (public read). No writes, no service role key.
//
// The `songs` table columns (as observed on this project):
//   id, title, artist, album, duration, cover_url, music_url
//
// `cover_url` / `music_url` may be full URLs OR storage paths
// in the `music` bucket — both are resolved to public URLs.
// Playlists still come from the local mock (no playlists table
// was requested); swap in a Supabase table later if needed.
// ============================================================

interface SongRow {
  id: string | number
  title: string
  artist: string
  album: string
  duration: number
  cover_url: string | null
  music_url: string | null
  track_no?: number | null
  year?: number | null
}

const STORAGE_BUCKET = 'music'

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown'
}

function mapRow(row: SongRow): { song: Song; albumTitle: string; cover: string | undefined } {
  const albumId = slug(row.album)
  const cover = resolvePublicUrl(STORAGE_BUCKET, row.cover_url) ?? row.cover_url ?? undefined
  const url = resolvePublicUrl(STORAGE_BUCKET, row.music_url) ?? row.music_url ?? undefined
  const song: Song = {
    id: String(row.id),
    title: row.title,
    artist: row.artist,
    albumId,
    durationSec: Number(row.duration) || 0,
    url,
    trackNo: row.track_no ?? undefined
  }
  return { song, albumTitle: row.album, cover }
}

export const SupabaseService = {
  /** True when the Supabase client is configured (env vars present). */
  get ready(): boolean {
    return Boolean(supabase)
  },

  /** Load the full catalog from Supabase. Throws if unreachable. */
  async loadLibrary(): Promise<{ songs: Song[]; albums: Album[]; artists: Artist[]; playlists: Playlist[] }> {
    if (!supabase) throw new Error('Supabase client not configured')

    const { data, error } = await supabase
      .from('songs')
      .select('id,title,artist,album,duration,cover_url,music_url')
      .order('album', { ascending: true })
      .order('title', { ascending: true })

    if (error) throw error
    if (!data || data.length === 0) {
      // Table exists but is empty — fall back to mock so the app isn't blank.
      return library
    }

    const songs: Song[] = []
    const albumMap = new Map<string, Album>()
    const artistMap = new Map<string, Artist>()

    for (const row of data as SongRow[]) {
      const { song, albumTitle, cover } = mapRow(row)
      songs.push(song)

      if (!albumMap.has(song.albumId)) {
        albumMap.set(song.albumId, {
          id: song.albumId,
          title: albumTitle,
          artist: song.artist,
          year: row.year ?? 0,
          cover: cover ?? `linear-gradient(135deg,#221e1a 0%,#c97a3f 100%)`,
          songIds: []
        })
      }
      albumMap.get(song.albumId)!.songIds.push(song.id)

      const artistId = slug(song.artist)
      if (!artistMap.has(artistId)) {
        artistMap.set(artistId, { id: artistId, name: song.artist, albumIds: [] })
      }
      const artist = artistMap.get(artistId)!
      if (!artist.albumIds.includes(song.albumId)) artist.albumIds.push(song.albumId)
    }

    return {
      songs,
      albums: Array.from(albumMap.values()),
      artists: Array.from(artistMap.values()),
      // Playlists not in Supabase yet — keep the curated mock ones.
      playlists: library.playlists
    }
  },

  /** In-library search across songs from Supabase. */
  async searchSongs(query: string): Promise<Song[]> {
    if (!supabase) return []
    const q = query.trim().toLowerCase()
    if (!q) return []
    const { data, error } = await supabase
      .from('songs')
      .select('id,title,artist,album,duration,cover_url,music_url')
      .or(`title.ilike.%${q}%,artist.ilike.%${q}%`)
      .limit(50)
    if (error) throw error
    return (data as SongRow[])?.map((r) => mapRow(r).song) ?? []
  },

  /** Public URL for streaming a song from the `music` bucket. */
  streamUrl(song: Song): string | undefined {
    return song.url ?? (song.id ? resolvePublicUrl(STORAGE_BUCKET, `${song.id}.mp3`) : undefined)
  }
}
