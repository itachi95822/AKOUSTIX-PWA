import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import { AlbumArt } from '@/components/ui/AlbumArt'
import { useCurrentSong, usePlayerStore } from '@/store/playerStore'
import { useAlbumById } from '@/store/libraryStore'
import { formatTime, cx } from '@/utils/format'

// ============================================================
// MiniPlayer — persistent bar above the bottom nav showing the
// current track. Tap to open the full Now Playing screen.
// Hidden on the Now Playing route itself.
// ============================================================

export function MiniPlayer() {
  const navigate = useNavigate()
  const song = useCurrentSong()
  const album = useAlbumById(song?.albumId)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const currentTime = usePlayerStore((s) => s.currentTime)

  return (
    <AnimatePresence>
      {song && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="sticky bottom-16 z-20 mx-2 mb-1"
        >
          <div
            className={cx(
              'era-bevel rounded-era bg-era-surface/95 backdrop-blur-md',
              'flex items-center gap-3 p-2 pr-3 cursor-pointer overflow-hidden'
            )}
            onClick={() => navigate('/now-playing')}
          >
            <AlbumArt cover={album?.cover ?? '#333'} alt={album?.title ?? ''} size="sm" rounded />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-body text-era-text leading-tight">
                {song.title}
              </p>
              <p className="truncate text-[12px] text-era-text-muted leading-tight">
                {song.artist}
              </p>
              <div className="mt-1 h-[3px] rounded-eraPill bg-era-track overflow-hidden">
                <div
                  className="h-full bg-era-accent-solid transition-[width] duration-1000 ease-linear"
                  style={{ width: `${(currentTime / song.durationSec) * 100}%` }}
                />
              </div>
            </div>
            <button
              aria-label={isPlaying ? 'Pause' : 'Play'}
              onClick={(e) => {
                e.stopPropagation()
                togglePlay()
              }}
              className="w-10 h-10 rounded-eraPill era-bevel bg-transparent text-era-text inline-flex items-center justify-center active:translate-y-px"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <span className="hidden sm:inline text-[11px] font-mono text-era-text-muted tabular-nums">
              {formatTime(currentTime)} / {formatTime(song.durationSec)}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
