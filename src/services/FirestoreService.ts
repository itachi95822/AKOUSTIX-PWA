import type { Album, Artist, Playlist, Song } from '@/types'
import { LibraryService } from './LibraryService'

// ============================================================
// Firestore service (PLACEHOLDER).
//
// Mirrors `LibraryService` so the screens can keep using the
// same function shapes. Today every method delegates to the
// local mock library. Switch each body to a Firestore query
// (e.g. `getDocs(collection(db, 'songs'))`) when wiring the
// backend — components won't need to change.
// ============================================================

export const FirestoreService = {
  async listSongs(): Promise<Song[]> {
    return LibraryService.getAllSongs()
  },
  async listAlbums(): Promise<Album[]> {
    return LibraryService.getAllAlbums()
  },
  async listArtists(): Promise<Artist[]> {
    return LibraryService.getAllArtists()
  },
  async listPlaylists(): Promise<Playlist[]> {
    return LibraryService.getAllPlaylists()
  },
  async getAlbum(id: string): Promise<Album | undefined> {
    return LibraryService.getAlbum(id)
  },
  async getPlaylist(id: string): Promise<Playlist | undefined> {
    return LibraryService.getPlaylist(id)
  },
  async searchSongs(query: string): Promise<Song[]> {
    return LibraryService.searchSongs(query)
  },

  // --- Favourites (per-user, ready for Firestore) ---
  async listFavourites(_userId: string): Promise<string[]> {
    return []
  },
  async addFavourite(_userId: string, _songId: string): Promise<void> {
    /* TODO: setDoc(doc(db, `users/{userId}/favourites/{songId}`)) */
  },
  async removeFavourite(_userId: string, _songId: string): Promise<void> {
    /* TODO: deleteDoc(...) */
  }
}
