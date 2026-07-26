import { create } from 'zustand'
import type { Album, Artist, Playlist, Song } from '@/types'
import { LibraryService } from '@/services/LibraryService'

// ============================================================
// Library store — loads the music catalog once at startup so
// every screen can read it synchronously. Swap the underlying
// `LibraryService` for a Firestore-backed impl later; this
// store's shape stays the same.
// ============================================================

interface LibraryState {
  loaded: boolean
  songs: Song[]
  albums: Album[]
  artists: Artist[]
  playlists: Playlist[]
  load: () => Promise<void>
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  loaded: false,
  songs: [],
  albums: [],
  artists: [],
  playlists: [],
  load: async () => {
    if (get().loaded) return
    const [songs, albums, artists, playlists] = await Promise.all([
      LibraryService.getAllSongs(),
      LibraryService.getAllAlbums(),
      LibraryService.getAllArtists(),
      LibraryService.getAllPlaylists()
    ])
    set({ songs, albums, artists, playlists, loaded: true })
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
