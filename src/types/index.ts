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
  /** Duration in seconds. */
  durationSec: number
  /** Optional remote URL — left empty until audio streaming is wired. */
  url?: string
  trackNo?: number
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
