import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RepeatMode, Song } from '@/types'

// ============================================================
// Player store — the single source of truth for playback.
//
// A shared <audio> element streams songs from their Supabase
// `music_url` (resolved via the `music` storage bucket). The
// store owns queue/index/shuffle/repeat/error; the engine
// (below) keeps the <audio> element in sync and reports
// timeupdate / ended / error events back into the store.
//
// Era switching never touches this store, so changing eras
// never interrupts the music.
// ============================================================

interface PlayerState {
  queue: Song[]
  index: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  shuffle: boolean
  repeat: RepeatMode
  favourites: string[]
  recentlyPlayed: string[]
  /** Transient, non-intrusive error message (e.g. a track failed to load). */
  error: string | null
  /** Timestamp of the last error, used by the toast to auto-dismiss. */
  errorAt: number | null

  // public actions
  playQueue: (songs: Song[], startIndex?: number) => void
  /** Play `song` in the context of the full library (queue = all songs, starts at song). */
  playSong: (song: Song, allSongs?: Song[]) => void
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
  jumpTo: (index: number) => void
  clearQueue: () => void
  clearError: () => void

  // internal — driven by the engine
  _tick: (time: number) => void
  _setDuration: (d: number) => void
  _handleTrackEnd: () => void
  _handleTrackError: () => void
}

const RECENT_LIMIT = 20

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      queue: [],
      index: 0,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      shuffle: false,
      repeat: 'off',
      favourites: [],
      recentlyPlayed: [],
      error: null,
      errorAt: null,

      playQueue: (songs, startIndex = 0) => {
        if (songs.length === 0) return
        const idx = Math.max(0, Math.min(startIndex, songs.length - 1))
        set({ queue: songs, index: idx, currentTime: 0, duration: songs[idx].durationSec, isPlaying: true, error: null })
        pushRecent(songs[idx].id)
      },

      playSong: (song, allSongs) => {
        if (allSongs && allSongs.length > 0) {
          // Queue the full library; start at the chosen song's position.
          const idx = Math.max(0, allSongs.findIndex((s) => s.id === song.id))
          set({ queue: allSongs, index: idx, currentTime: 0, duration: allSongs[idx].durationSec, isPlaying: true, error: null })
          pushRecent(allSongs[idx].id)
        } else {
          set({ queue: [song], index: 0, currentTime: 0, duration: song.durationSec, isPlaying: true, error: null })
          pushRecent(song.id)
        }
      },

      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),

      // Always advances to the next track (manual press OR auto-advance when
      // repeat !== 'one'). Repeat-One replay on natural end is handled by the
      // engine's `ended` event, not here.
      next: () => {
        const { queue, index, repeat, shuffle } = get()
        if (queue.length === 0) return
        let nextIdx: number
        if (shuffle) {
          if (queue.length === 1) nextIdx = index
          else {
            // True shuffle: never immediately repeat the current track.
            do {
              nextIdx = Math.floor(Math.random() * queue.length)
            } while (nextIdx === index)
          }
        } else {
          nextIdx = index + 1
          if (nextIdx >= queue.length) {
            if (repeat === 'all') nextIdx = 0
            else {
              // End of queue, no repeat → stop at the end of the last track.
              set({ isPlaying: false, currentTime: queue[index].durationSec, duration: queue[index].durationSec })
              return
            }
          }
        }
        set({ index: nextIdx, currentTime: 0, duration: queue[nextIdx].durationSec, isPlaying: true, error: null })
        pushRecent(queue[nextIdx].id)
      },

      prev: () => {
        const { queue, index, currentTime, repeat } = get()
        if (queue.length === 0) return
        // Restart current track if we're more than 3s in.
        if (currentTime > 3) {
          set({ currentTime: 0 })
          if (audioEl) audioEl.currentTime = 0
          return
        }
        let prevIdx = index - 1
        if (prevIdx < 0) prevIdx = repeat === 'all' ? queue.length - 1 : 0
        set({ index: prevIdx, currentTime: 0, duration: queue[prevIdx].durationSec, isPlaying: true, error: null })
        pushRecent(queue[prevIdx].id)
      },

      seek: (sec) => {
        const t = Math.max(0, sec)
        set({ currentTime: t })
        const el = audioEl
        if (el && !Number.isNaN(el.duration)) el.currentTime = t
      },

      setVolume: (v) => {
        const nv = Math.max(0, Math.min(1, v))
        set({ volume: nv })
        if (audioEl) audioEl.volume = nv
      },

      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
      cycleRepeat: () =>
        set((s) => ({
          repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off'
        })),

      toggleFavourite: (songId) =>
        set((s) => ({
          favourites: s.favourites.includes(songId)
            ? s.favourites.filter((id) => id !== songId)
            : [...s.favourites, songId]
        })),

      isFavourite: (songId) => get().favourites.includes(songId),

      // Jump to an arbitrary queue position (from the Queue drawer).
      jumpTo: (i) => {
        const { queue } = get()
        if (i < 0 || i >= queue.length) return
        set({ index: i, currentTime: 0, duration: queue[i].durationSec, isPlaying: true, error: null })
        pushRecent(queue[i].id)
      },

      clearQueue: () => set({ queue: [], index: 0, currentTime: 0, duration: 0, isPlaying: false, error: null }),

      clearError: () => set({ error: null, errorAt: null }),

      _tick: (time) => set({ currentTime: time }),
      _setDuration: (d) => set({ duration: d }),

      // Called by the engine on natural track end.
      _handleTrackEnd: () => {
        const { repeat } = get()
        if (repeat === 'one') {
          // Replay the current track from the start.
          set({ currentTime: 0, isPlaying: true })
          if (audioEl) {
            audioEl.currentTime = 0
            void audioEl.play().catch(() => {
              usePlayerStore.setState({ isPlaying: false })
            })
          }
          return
        }
        get().next()
      },

      // Called by the engine when the audio file fails to load.
      _handleTrackError: () => {
        const { queue, index } = get()
        const failed = queue[index]
        const msg = failed
          ? `Couldn’t load “${failed.title}” — skipping to the next track.`
          : 'Couldn’t load this track.'
        // Advance first (next() clears any prior error), then set this
        // error so it survives the skip and surfaces in the toast.
        get().next()
        set({ error: msg, errorAt: Date.now() })
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
// A single shared <audio> element streams songs from their
// Supabase `music_url` (resolved via the `music` storage bucket).
// `timeupdate` drives the progress clock; `ended` advances or
// repeats per the repeat mode; `error` skips to the next track
// and surfaces a non-intrusive error message.

let audioEl: HTMLAudioElement | null = null
// Guard against an error loop when every track in the queue fails.
let consecutiveErrors = 0

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
    // Real duration once metadata loads.
    audioEl.addEventListener('loadedmetadata', () => {
      if (!audioEl) return
      const d = audioEl.duration
      if (Number.isFinite(d) && d > 0) usePlayerStore.getState()._setDuration(d)
    })
    // Track ended → repeat-one replay or advance.
    audioEl.addEventListener('ended', () => {
      usePlayerStore.getState()._handleTrackEnd()
    })
    // Load/error → skip + show a non-intrusive error.
    audioEl.addEventListener('error', () => {
      const s = usePlayerStore.getState()
      consecutiveErrors += 1
      if (consecutiveErrors > s.queue.length) {
        // Everything failed — stop rather than loop forever.
        usePlayerStore.setState({
          isPlaying: false,
          error: 'Couldn’t load any track in the queue. Check your connection and try again.',
          errorAt: Date.now()
        })
        return
      }
      s._handleTrackError()
    })
    audioEl.volume = usePlayerStore.getState().volume
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
    // No streamable URL — treat as an error (skip).
    el.pause()
    s._handleTrackError()
    return
  }
  if (el.src !== url) {
    el.src = url
    el.currentTime = s.currentTime
  }
  el.volume = s.volume
  if (s.isPlaying) {
    void el
      .play()
      .then(() => {
        // A real play started — reset the error loop guard.
        consecutiveErrors = 0
      })
      .catch(() => {
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

// ---------- Selectors / helpers ----------

export function useCurrentSong(): Song | undefined {
  return usePlayerStore((s) => s.queue[s.index])
}

export function progressPct(current: number, duration: number): number {
  if (!duration) return 0
  return Math.min(100, (current / duration) * 100)
}
