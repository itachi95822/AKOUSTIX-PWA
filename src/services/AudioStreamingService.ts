import type { Song } from '@/types'

// ============================================================
// Audio streaming service — the seam for real audio playback.
//
// The player store drives a shared <audio> element directly
// from each song's `music_url` (Supabase `music` bucket). This
// module is kept as a thin helper for resolving streamable URLs
// and creating dedicated streams if needed later.
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
