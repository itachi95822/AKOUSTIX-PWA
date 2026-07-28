import type { Album, Artist, Playlist, Song } from '@/types'
import { library } from '@/data/library'
import { SupabaseService } from './SupabaseService'

// ============================================================
// Library service — the only door components open to reach
// music data.
//
// Supabase-first: when the Supabase client is configured and the
// `songs` table has rows, reads come from Supabase (RLS-protected,
// `music` bucket for audio + cover art). Otherwise it falls back
// to the local mock library so the app is never blank — during
// setup, offline, or before any rows are inserted.
//
// Screens call the same functions either way, so switching to
// Supabase required zero changes in the UI.
// ============================================================

// Cached Supabase load (one fetch per session; invalidation on demand).
type LibraryData = { songs: Song[]; albums: Album[]; artists: Artist[]; playlists: Playlist[] }
let cache: LibraryData | null = null
let loadPromise: Promise<LibraryData> | null = null

async function load(): Promise<LibraryData> {
  if (cache) return cache
  if (!loadPromise) {
    loadPromise = (async () => {
      if (SupabaseService.ready) {
        try {
          const data = await SupabaseService.loadLibrary()
          // Only cache Supabase data if it actually has songs; otherwise
          // keep using the mock so the app shows content.
          if (data.songs.length > 0) {
            cache = data
            return cache
          }
        } catch {
          // Network/permission error — fall through to mock.
        }
      }
      cache = library
      return cache
    })()
  }
  return await loadPromise
}

export const LibraryService = {
  /** Force a fresh fetch from Supabase on next read (e.g. after uploads). */
  invalidate() {
    cache = null
    loadPromise = null
  },

  async getAllSongs(): Promise<Song[]> {
    return (await load()).songs
  },

  async getAllAlbums(): Promise<Album[]> {
    return (await load()).albums
  },

  async getAllArtists(): Promise<Artist[]> {
    return (await load()).artists
  },

  async getAllPlaylists(): Promise<Playlist[]> {
    return (await load()).playlists
  },

  async getAlbum(id: string): Promise<Album | undefined> {
    return (await load()).albums.find((a) => a.id === id)
  },

  async getArtist(id: string): Promise<Artist | undefined> {
    return (await load()).artists.find((a) => a.id === id)
  },

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    return (await load()).playlists.find((p) => p.id === id)
  },

  async getSong(id: string): Promise<Song | undefined> {
    return (await load()).songs.find((s) => s.id === id)
  },

  async getAlbumSongs(albumId: string): Promise<Song[]> {
    return (await load()).songs.filter((s) => s.albumId === albumId)
  },

  /** In-library search across song titles + artist names. */
  async searchSongs(query: string): Promise<Song[]> {
    const q = query.trim().toLowerCase()
    if (!q) return []
    // Use Supabase-backed search when live; else local.
    if (SupabaseService.ready && cache && cache !== library) {
      try {
        return await SupabaseService.searchSongs(q)
      } catch {
        // fall through to local
      }
    }
    const data = await load()
    return data.songs.filter(
      (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
    )
  }
}
