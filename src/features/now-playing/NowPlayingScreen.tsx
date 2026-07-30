import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Music } from 'lucide-react'
import { useEraStore, ERAS } from '@/eras/EraProvider'
import { useCurrentSong, usePlayerStore } from '@/store/playerStore'
import { useAlbumById } from '@/store/libraryStore'
import { EmptyState } from '@/components/ui/Primitives'
import { CassettePlayer } from './players/CassettePlayer'
import { CDPlayer } from './players/CDPlayer'
import { ComputerPlayer } from './players/ComputerPlayer'
import { QueueDrawer } from './QueueDrawer'
import { LyricsPanel } from './LyricsPanel'
import type { EraPlayerProps } from './parts'

// ============================================================
// NowPlayingScreen — hosts the era-specific player. The whole
// player transforms per era; playback state is shared so era
// switching never interrupts the music.
// ============================================================

export function NowPlayingScreen() {
  const navigate = useNavigate()
  const era = useEraStore((s) => s.era)
  const setEra = useEraStore((s) => s.setEra)
  const song = useCurrentSong()
  const album = useAlbumById(song?.albumId)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const repeat = usePlayerStore((s) => s.repeat)
  const shuffle = usePlayerStore((s) => s.shuffle)
  const favourites = usePlayerStore((s) => s.favourites)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const next = usePlayerStore((s) => s.next)
  const prev = usePlayerStore((s) => s.prev)
  const seek = usePlayerStore((s) => s.seek)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat)
  const toggleFavourite = usePlayerStore((s) => s.toggleFavourite)

  const [panel, setPanel] = useState<'none' | 'queue' | 'lyrics'>('none')

  if (!song) {
    return (
      <div className="akx-shell flex flex-col era-grain-overlay">
        <header className="px-4 pt-6 flex items-center gap-2">
          <BackBtn onClick={() => navigate('/')} />
        </header>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={<Music size={26} />}
            title="Nothing is playing"
            message="Pick a song from Home, Search or Library and it will play here."
          />
        </div>
      </div>
    )
  }

  const playerProps: EraPlayerProps = {
    song,
    album,
    isPlaying,
    currentTime,
    duration: song.durationSec,
    repeat,
    shuffle,
    isFavourite: favourites.includes(song.id),
    onSeek: seek,
    onTogglePlay: togglePlay,
    onNext: next,
    onPrev: prev,
    onToggleShuffle: toggleShuffle,
    onCycleRepeat: cycleRepeat,
    onToggleFavourite: () => toggleFavourite(song.id),
    onOpenLyrics: () => setPanel('lyrics'),
    onOpenQueue: () => setPanel('queue')
  }

  const Player = era === 'cassette' ? CassettePlayer : era === 'cd' ? CDPlayer : ComputerPlayer

  return (
    <div className="akx-shell flex flex-col era-grain-overlay">
      {/* Header */}
      <header className="px-3 pt-6 pb-1 flex items-center justify-between" style={{ paddingTop: 'max(env(safe-area-inset-top), 1.5rem)' }}>
        <BackBtn onClick={() => navigate(-1)} />
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-era-text-muted">
            Now Playing
          </span>
          <span className="text-[12px] font-body text-era-text">
            {ERAS[era].glyph} {ERAS[era].name}
          </span>
        </div>
        <EraQuickSwitch era={era} onChange={setEra} />
      </header>

      {/* Era player — crossfade on era change */}
      <main className="flex-1 overflow-y-auto era-scroll">
        <AnimatePresence mode="wait">
          <motion.div
            key={era}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <Player {...playerProps} />
          </motion.div>
        </AnimatePresence>
      </main>

      <QueueDrawer open={panel === 'queue'} onClose={() => setPanel('none')} />
      <LyricsPanel open={panel === 'lyrics'} onClose={() => setPanel('none')} />
    </div>
  )
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      aria-label="Back"
      onClick={onClick}
      className="w-10 h-10 inline-flex items-center justify-center rounded-eraPill era-bevel bg-era-surface text-era-text"
    >
      <ChevronLeft size={22} />
    </button>
  )
}

function EraQuickSwitch({
  era,
  onChange
}: {
  era: 'cassette' | 'cd' | 'computer'
  onChange: (e: 'cassette' | 'cd' | 'computer') => void
}) {
  const order = ['cassette', 'cd', 'computer'] as const
  return (
    <button
      aria-label="Switch era"
      onClick={() => {
        const idx = order.indexOf(era)
        onChange(order[(idx + 1) % order.length])
      }}
      className="h-10 px-3 rounded-eraPill era-bevel bg-era-surface text-era-text inline-flex items-center gap-1.5"
    >
      <span className="text-base leading-none">{ERAS[era].glyph}</span>
    </button>
  )
}
