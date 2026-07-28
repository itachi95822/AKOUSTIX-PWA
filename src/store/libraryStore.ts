import { create } from 'zustand'
import type { Album, Artist, Playlist, Song } from '@/types'
import { LibraryService } from '@/services/LibraryService'

// ============================================================
// Library store — loads the music catalog once at startup from
// Supabase (the only source of truth) so every screen can read
// it synchronously. Exposes loading / error / empty states so
// screens can show the right UI instead of fake songs.
// ============================================================

export type LibraryStatus = 'idle' | 'loading' | 'loaded' | 'error'

interface LibraryState {
  status: LibraryStatus
  error: string | null
  songs: Song[]
  albums: Album[]
  artists: Artist[]
  playlists: Playlist[]
  load: () => Promise<void>
  retry: () => Promise<void>
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  status: 'idle',
  error: null,
  songs: [],
  albums: [],
  artists: [],
  playlists: [],
  load: async () => {
    if (get().status === 'loading' || get().status === 'loaded') return
    set({ status: 'loading', error: null })
    try {
      const data = await LibraryService.loadLibrary()
      set({ ...data, status: 'loaded', error: null })
    } catch (e) {
      set({ status: 'error', error: e instanceof Error ? e.message : 'Failed to load library' })
    }
  },
  retry: async () => {
    set({ status: 'idle', error: null, songs: [], albums: [], artists: [], playlists: [] })
    await get().load()
  }
}))

// ---- derived helpers ----

export function useAlbumById(id?: string): Album | undefined {
  return useLibraryStore((s) => s.albums.find((a) => a.id === id))
}

export function useSongById(id?: string): Song | undefined {
  return useLibraryStore((s) => s.songs.find((x) => x.id === id))
}

export function useAlbumSongs(albumId?: string): Song[] {
  return useLibraryStore((s) =>
    albumId ? s.songs.filter((x) => x.albumId === albumId) : []
  )
}
