import type { Song } from '@/types'

// ============================================================
// Audio streaming service (PLACEHOLDER).
//
// Today the player store simulates playback with a 1s ticker
// because the mock library has no audio URLs. This module is
// the seam where real audio goes in:
//
//   - Resolve a streamable URL from Firebase Storage, or
//   - Drive a shared <audio> element and emit timeupdate /
//     ended events back into the player store.
//
// The player store's public API (play/pause/next/seek/...) is
// intentionally stable so this swap needs no UI changes.
// ============================================================

export interface StreamHandle {
  audio: HTMLAudioElement
  stop: () => void
}

export const AudioStreamingService = {
  /** Resolve a playable URL for a song (Storage ref -> downloadURL). */
  async resolveUrl(song: Song): Promise<string | null> {
    return song.url ?? null
  },

  /** Create + mount a hidden <audio> element bound to `url`. */
  createStream(url: string): StreamHandle {
    const audio = new Audio(url)
    audio.preload = 'auto'
    return {
      audio,
      stop: () => {
        audio.pause()
        audio.src = ''
      }
    }
  }
}
