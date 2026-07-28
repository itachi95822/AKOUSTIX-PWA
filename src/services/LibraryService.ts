import type { Album, Artist, Playlist, Song } from '@/types'
import { SupabaseService, type LibraryData } from './SupabaseService'

// ============================================================
// Library service — the only door components open to reach
// music data. Supabase is the sole source of truth: songs,
// albums, artists, genres, cover art and audio all come from
// the `songs` table + `music` storage bucket.
//
// No mock fallback. If Supabase is unreachable or the table is
// empty, callers surface a loading / error / empty state to the
// user instead of showing fake songs.
// ============================================================

let cache: LibraryData | null = null
let loadPromise: Promise<LibraryData> | null = null

async function load(): Promise<LibraryData> {
  if (cache) return cache
  if (!loadPromise) {
    loadPromise = SupabaseService.loadLibrary().then((data) => {
      cache = data
      return data
    })
    // A failed load clears the in-flight promise so a retry can re-fetch.
    loadPromise.catch(() => {
      loadPromise = null
    })
  }
  return await loadPromise
}

export const LibraryService = {
  /** True when Supabase env vars are configured. */
  get ready(): boolean {
    return SupabaseService.ready
  },

  /** Load the entire catalog in one call. Throws on error; empty table → empty arrays. */
  async loadLibrary(): Promise<LibraryData> {
    return load()
  },

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

  /** In-library search across song titles + artist names (Supabase-backed). */
  async searchSongs(query: string): Promise<Song[]> {
    return SupabaseService.searchSongs(query)
  }
}
