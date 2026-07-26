import { motion } from 'framer-motion'
import { SkipBack, SkipForward } from 'lucide-react'
import { formatTime, cx } from '@/utils/format'
import { ControlButton, PlayPauseButton, SecondaryActions, type EraPlayerProps } from '../parts'

function seekFromEvent(e: React.MouseEvent<HTMLDivElement>, duration: number, onSeek: (s: number) => void) {
  const rect = e.currentTarget.getBoundingClientRect()
  const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  onSeek(pct * duration)
}

// ============================================================
// Compact Disc Era player — a spinning disc with metallic
// reflections on a brushed-aluminium face. Minimal controls,
// thin typography, soft shadows.
// ============================================================

export function CDPlayer(props: EraPlayerProps) {
  const {
    song,
    album,
    isPlaying,
    currentTime,
    duration,
    repeat,
    shuffle,
    isFavourite,
    onSeek,
    onTogglePlay,
    onNext,
    onPrev,
    onToggleShuffle,
    onCycleRepeat,
    onToggleFavourite,
    onOpenLyrics,
    onOpenQueue
  } = props

  const pct = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="px-5 pt-2 pb-6 flex flex-col items-center">
      {/* Aluminium face plate */}
      <motion.div
        layout
        className="relative w-full rounded-eraLg p-8 flex flex-col items-center"
        style={{
          background: 'linear-gradient(160deg,#ffffff 0%,#ececec 45%,#c9c9c9 100%)',
          boxShadow: 'var(--era-shadow), inset 0 1px 0 #ffffff, inset 0 -1px 0 #b8b8b8'
        }}
      >
        {/* Brushed metal sheen */}
        <div
          className="absolute inset-0 rounded-eraLg opacity-40 pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(90deg,rgba(255,255,255,0.6) 0px,rgba(255,255,255,0) 1px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0) 3px)'
          }}
        />

        {/* Spinning CD */}
        <button
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onClick={onTogglePlay}
          className="relative w-56 h-56 rounded-full focus:outline-none"
        >
          <div
            className={cx(
              'w-full h-full rounded-full relative',
              isPlaying ? 'animate-spin-slow' : ''
            )}
            style={{ animationDuration: '6s' }}
          >
            {/* Disc body */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%,#1a1a1a 0%,#2b2b2b 22%,#c9c9c9 24%,#e0e0e0 60%,#b8b8b8 100%)'
              }}
            />
            {/* Rainbow sheen */}
            <div
              className="absolute inset-0 rounded-full opacity-40"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(255,120,0,0.25), rgba(0,180,255,0.25), rgba(180,0,255,0.25), rgba(0,255,160,0.25), rgba(255,120,0,0.25))'
              }}
            />
            {/* Track grooves */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-black/5"
                style={{
                  inset: `${30 + i * 7}px`
                }}
              />
            ))}
            {/* Center label */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center text-white"
              style={{ background: album?.cover ?? '#1a1a1a' }}
            >
              <div className="w-3 h-3 rounded-full bg-white/90 ring-1 ring-black/20" />
            </div>
          </div>
          {/* Hover play/pause hint */}
          <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/10">
            <span className="text-white text-xs font-body bg-black/40 px-3 py-1 rounded-full">
              {isPlaying ? 'Pause' : 'Play'}
            </span>
          </div>
        </button>

        {/* Title block */}
        <div className="relative mt-6 text-center">
          <p className="font-display text-2xl font-light tracking-tight text-era-text leading-tight">
            {song.title}
          </p>
          <p className="text-[13px] text-era-text-muted font-light tracking-wide mt-0.5">
            {song.artist} — {album?.title}
          </p>
        </div>
      </motion.div>

      {/* Thin progress */}
      <div className="w-full mt-7">
        <div
          className="group relative h-1 rounded-full bg-era-track cursor-pointer"
          onClick={(e) => seekFromEvent(e, duration, onSeek)}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-era-accent-solid"
            style={{ width: `${pct}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-era-accent-solid opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] font-mono text-era-text-muted tabular-nums tracking-wider">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Minimal controls */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <ControlButton label="Previous" onClick={onPrev} className="w-11 h-11">
          <SkipBack size={20} fill="currentColor" />
        </ControlButton>
        <PlayPauseButton isPlaying={isPlaying} onToggle={onTogglePlay} size="lg" />
        <ControlButton label="Next" onClick={onNext} className="w-11 h-11">
          <SkipForward size={20} fill="currentColor" />
        </ControlButton>
      </div>

      <div className="mt-5">
        <SecondaryActions
          isFavourite={isFavourite}
          onToggleFavourite={onToggleFavourite}
          onOpenLyrics={onOpenLyrics}
          onOpenQueue={onOpenQueue}
          repeat={repeat}
          onCycleRepeat={onCycleRepeat}
          shuffle={shuffle}
          onToggleShuffle={onToggleShuffle}
        />
      </div>
    </div>
  )
}
