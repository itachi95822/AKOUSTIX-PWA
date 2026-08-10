// ============================================================
// AKOUSTIX — Shared domain types
// Kept backend-agnostic so Firebase/Firestore can be wired in
// later without touching component code.
// ============================================================

export type EraId = 'cassette' | 'cd' | 'computer'

export interface Song {
  id: string
  title: string
  artist: string
  albumId: string
  /** Duration in seconds (parsed from the `duration` TEXT "mm:ss" column). */
  durationSec: number
  /** Optional remote URL — resolved from the `music_url` column / `music` bucket. */
  url?: string
  /** Genre from the `genre` column (e.g. "Romance", "Calming"). */
  genre?: string
}

export interface Album {
  id: string
  title: string
  artist: string
  year: number
  /** CSS gradient or solid used to render artwork when no image is present. */
  cover: string
  songIds: string[]
}

export interface Artist {
  id: string
  name: string
  albumIds: string[]
}

export interface Playlist {
  id: string
  title: string
  description: string
  songIds: string[]
  cover: string
}

export type RepeatMode = 'off' | 'all' | 'one'

export interface Playable {
  song: Song
  album: Album
}

/** One saved Memory per song — up to 5 photos plus optional note/date/time. */
export interface SongMemory {
  songId: string
  /** Data-URL images chosen from the device gallery (1–5). */
  photos: string[]
  /** Optional note — at most 10 words. */
  note?: string
  /** Optional calendar date, ISO `YYYY-MM-DD`. */
  date?: string
  /** Optional time, 24-hour `HH:MM`. */
  time?: string
  /** Last-saved timestamp (ms). */
  updatedAt: number
}
