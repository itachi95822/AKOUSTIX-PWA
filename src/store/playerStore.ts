import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RepeatMode, Song } from '@/types'

// ============================================================
// Player store — the single source of truth for playback.
//
// Today playback is SIMULATED with a 1s ticker because the
// mock library has no audio URLs. When `AudioStreamingService`
// is wired in, replace the ticker body with real element
// control — the store's public API stays the same, so every
// screen and every era-player keeps working untouched.
//
// Era switching never touches this store, so changing eras
// never interrupts the music.
// ============================================================

interface PlayerState {
  queue: Song[]
  index: number
  isPlaying: boolean
  currentTime: number
  volume: number
  shuffle: boolean
  repeat: RepeatMode
  favourites: string[]
  recentlyPlayed: string[]

  // public actions
  playQueue: (songs: Song[], startIndex?: number) => void
  playSong: (song: Song) => void
  togglePlay: () => void
  play: () => void
  pause: () => void
  next: () => void
  prev: () => void
  seek: (sec: number) => void
  setVolume: (v: number) => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  toggleFavourite: (songId: string) => void
  isFavourite: (songId: string) => boolean
  clearQueue: () => void

  // internal — driven by the ticker
  _tick: (time: number) => void
  _handleTrackEnd: () => void
}

const RECENT_LIMIT = 20

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      queue: [],
      index: 0,
      isPlaying: false,
      currentTime: 0,
      volume: 0.8,
      shuffle: false,
      repeat: 'off',
      favourites: [],
      recentlyPlayed: [],

      playQueue: (songs, startIndex = 0) => {
        if (songs.length === 0) return
        const idx = Math.max(0, Math.min(startIndex, songs.length - 1))
        set({ queue: songs, index: idx, currentTime: 0, isPlaying: true })
        pushRecent(songs[idx].id)
      },

      playSong: (song) => {
        set({ queue: [song], index: 0, currentTime: 0, isPlaying: true })
        pushRecent(song.id)
      },

      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),

      next: () => {
        const { queue, index, repeat, shuffle } = get()
        if (queue.length === 0) return
        if (repeat === 'one') {
          set({ currentTime: 0, isPlaying: true })
          return
        }
        let nextIdx: number
        if (shuffle) {
          if (queue.length === 1) nextIdx = index
          else {
            do {
              nextIdx = Math.floor(Math.random() * queue.length)
            } while (nextIdx === index)
          }
        } else {
          nextIdx = index + 1
          if (nextIdx >= queue.length) {
            if (repeat === 'all') nextIdx = 0
            else {
              set({ isPlaying: false, currentTime: queue[index].durationSec })
              return
            }
          }
        }
        set({ index: nextIdx, currentTime: 0, isPlaying: true })
        pushRecent(queue[nextIdx].id)
      },

      prev: () => {
        const { queue, index, currentTime } = get()
        if (queue.length === 0) return
        // Restart current track if we're more than 3s in.
        if (currentTime > 3) {
          set({ currentTime: 0 })
          return
        }
        let prevIdx = index - 1
        if (prevIdx < 0) prevIdx = get().repeat === 'all' ? queue.length - 1 : 0
        set({ index: prevIdx, currentTime: 0, isPlaying: true })
        pushRecent(queue[prevIdx].id)
      },

      seek: (sec) => {
        const t = Math.max(0, sec)
        set({ currentTime: t })
        const el = audioEl
        if (el && !Number.isNaN(el.duration)) el.currentTime = t
      },

      setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),

      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
      cycleRepeat: () =>
        set((s) => ({
          repeat:
            s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off'
        })),

      toggleFavourite: (songId) =>
        set((s) => ({
          favourites: s.favourites.includes(songId)
            ? s.favourites.filter((id) => id !== songId)
            : [...s.favourites, songId]
        })),

      isFavourite: (songId) => get().favourites.includes(songId),

      clearQueue: () => set({ queue: [], index: 0, currentTime: 0, isPlaying: false }),

      _tick: (time) => set({ currentTime: time }),
      _handleTrackEnd: () => {
        get().next()
      }
    }),
    {
      name: 'akoustix-player',
      partialize: (s) => ({
        volume: s.volume,
        shuffle: s.shuffle,
        repeat: s.repeat,
        favourites: s.favourites,
        recentlyPlayed: s.recentlyPlayed
      })
    }
  )
)

function pushRecent(songId: string) {
  const state = usePlayerStore.getState()
  const next = [songId, ...state.recentlyPlayed.filter((id) => id !== songId)].slice(0, RECENT_LIMIT)
  usePlayerStore.setState({ recentlyPlayed: next })
}

// ---------- Playback engine ----------
// Real audio streaming when a song has a URL (Supabase `music_url`),
// simulated ticker otherwise (mock library). A single shared
// <audio> element drives currentTime + track-end transitions; the
// 1s ticker only runs for URL-less songs so the UI still advances.

let audioEl: HTMLAudioElement | null = null
let ticker: ReturnType<typeof setInterval> | null = null

function getAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  if (!audioEl) {
    audioEl = new Audio()
    audioEl.preload = 'auto'
    // Sync store time from the element's clock.
    audioEl.addEventListener('timeupdate', () => {
      if (!audioEl) return
      const s = usePlayerStore.getState()
      if (s.isPlaying) s._tick(audioEl.currentTime)
    })
    // Track ended → next (honors repeat/shuffle via the store).
    audioEl.addEventListener('ended', () => {
      usePlayerStore.getState()._handleTrackEnd()
    })
    // Apply current volume.
    const v = usePlayerStore.getState().volume
    audioEl.volume = v
  }
  return audioEl
}

/** Load a song into the audio element and start/pause per store state. */
function syncAudio() {
  const s = usePlayerStore.getState()
  const cur = s.queue[s.index]
  const el = getAudio()
  if (!el || !cur) return
  const url = cur.url
  if (!url) {
    // No real URL — simulation handles it. Pause any live audio.
    el.pause()
    return
  }
  if (el.src !== url) {
    el.src = url
    el.currentTime = s.currentTime
  }
  el.volume = s.volume
  if (s.isPlaying) {
    void el.play().catch(() => {
      // Autoplay can be blocked before a user gesture — reflect paused state.
      usePlayerStore.setState({ isPlaying: false })
    })
  } else {
    el.pause()
  }
}

// Re-sync whenever playback-affecting state changes.
usePlayerStore.subscribe((state, prev) => {
  if (
    state.queue !== prev.queue ||
    state.index !== prev.index ||
    state.isPlaying !== prev.isPlaying ||
    state.volume !== prev.volume
  ) {
    syncAudio()
  }
})

// Simulated ticker — only advances for URL-less (mock) songs.
function ensureTicker() {
  if (ticker) return
  ticker = setInterval(() => {
    const s = usePlayerStore.getState()
    if (!s.isPlaying) return
    const cur = s.queue[s.index]
    if (!cur || cur.url) return // real audio drives itself
    const nextTime = s.currentTime + 1
    if (nextTime >= cur.durationSec) {
      s._handleTrackEnd()
    } else {
      s._tick(nextTime)
    }
  }, 1000)
}

ensureTicker()

// ---------- Selectors / helpers ----------

export function useCurrentSong(): Song | undefined {
  return usePlayerStore((s) => s.queue[s.index])
}

export function progressPct(current: number, duration: number): number {
  if (!duration) return 0
  return Math.min(100, (current / duration) * 100)
}
