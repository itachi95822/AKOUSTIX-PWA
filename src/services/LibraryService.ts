import type { Album, Artist, Playlist, Song } from '@/types'
import { library } from '@/data/library'

// ============================================================
// Library service — the only door components open to reach
// music data. Today it reads the local mock library; tomorrow
// it can call Firestore behind the same functions, so screens
// never need to change.
// ============================================================

export const LibraryService = {
  async getAllSongs(): Promise<Song[]> {
    return library.songs
  },

  async getAllAlbums(): Promise<Album[]> {
    return library.albums
  },

  async getAllArtists(): Promise<Artist[]> {
    return library.artists
  },

  async getAllPlaylists(): Promise<Playlist[]> {
    return library.playlists
  },

  async getAlbum(id: string): Promise<Album | undefined> {
    return library.albums.find((a) => a.id === id)
  },

  async getArtist(id: string): Promise<Artist | undefined> {
    return library.artists.find((a) => a.id === id)
  },

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    return library.playlists.find((p) => p.id === id)
  },

  async getSong(id: string): Promise<Song | undefined> {
    return library.songs.find((s) => s.id === id)
  },

  async getAlbumSongs(albumId: string): Promise<Song[]> {
    return library.songs.filter((s) => s.albumId === albumId)
  },

  /** In-library search across song titles + artist names. */
  async searchSongs(query: string): Promise<Song[]> {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return library.songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q)
    )
  }
}
