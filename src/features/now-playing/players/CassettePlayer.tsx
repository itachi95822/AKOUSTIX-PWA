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
// Cassette Era player — vintage cassette with rotating reels,
// analogue VU meters, tape-strip progress and a walnut panel.
// ============================================================

export function CassettePlayer(props: EraPlayerProps) {
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
    <div className="px-4 pt-2 pb-6 flex flex-col items-center">
      {/* Walnut cassette deck panel */}
      <motion.div
        layout
        className="era-grain-overlay relative w-full rounded-eraLg p-5 era-bevel"
        style={{
          background:
            'linear-gradient(160deg,#3a322a 0%,#2e2823 50%,#241f1a 100%)',
          boxShadow: 'var(--era-shadow), inset 0 1px 0 rgba(243,232,207,0.06)'
        }}
      >
        {/* Top knob row */}
        <div className="flex items-center justify-between mb-4">
          <Knob label="VOL" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#c8b48f] uppercase">
              Akoustix
            </span>
            <span className="text-[9px] font-mono text-[#c97a3f] uppercase tracking-widest">
              Tape Deck
            </span>
          </div>
          <Knob label="TON" />
        </div>

        {/* Cassette body */}
        <div
          className="relative rounded-era overflow-hidden p-4"
          style={{
            background: 'linear-gradient(180deg,#f3e8cf 0%,#d9c9a8 100%)',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.25)'
          }}
        >
          {/* Label window */}
          <div className="rounded-era-sm bg-[#221e1a]/85 px-3 py-2 mb-3 text-center">
            <p className="truncate font-display text-[#f3e8cf] text-lg leading-tight">
              {song.title}
            </p>
            <p className="truncate text-[11px] font-mono text-[#c8b48f] tracking-wide">
              {song.artist} — {album?.title}
            </p>
          </div>

          {/* Reels + tape */}
          <div className="relative h-24 flex items-center justify-between px-4">
            <Reel spinning={isPlaying} />
            {/* Tape strip with progress */}
            <div className="flex-1 mx-3 h-3 rounded-full bg-[#221e1a]/70 overflow-hidden relative">
              <div
                className="absolute inset-y-0 left-0 bg-[#c97a3f]/80"
                style={{ width: `${pct}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8px] font-mono text-[#f3e8cf]/70 tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
            <Reel spinning={isPlaying} reverse />
          </div>

          {/* VU meters */}
          <div className="mt-4 flex items-end justify-center gap-6">
            <VuMeter label="L" active={isPlaying} />
            <VuMeter label="R" active={isPlaying} delay={120} />
          </div>
        </div>
      </motion.div>

      {/* Tape-style scrubber */}
      <div className="w-full mt-6">
        <div
          className="group relative h-2 rounded-full bg-era-track cursor-pointer"
          onClick={(e) => seekFromEvent(e, duration, onSeek)}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-era-accent-solid"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] font-mono text-era-text-muted tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
        </div>
      </div>

      {/* Transport controls */}
      <div className="mt-5 flex items-center justify-center gap-4">
        <ControlButton label="Previous" onClick={onPrev} className="w-12 h-12">
          <SkipBack size={22} fill="currentColor" />
        </ControlButton>
        <PlayPauseButton isPlaying={isPlaying} onToggle={onTogglePlay} size="xl" />
        <ControlButton label="Next" onClick={onNext} className="w-12 h-12">
          <SkipForward size={22} fill="currentColor" />
        </ControlButton>
      </div>

      {/* Secondary actions */}
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

function Knob({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-7 h-7 rounded-full era-bevel"
        style={{
          background: 'radial-gradient(circle at 30% 30%,#6b4a2b,#221e1a)',
          boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.5)'
        }}
      >
        <div className="w-full h-full rounded-full flex items-start justify-center pt-0.5">
          <div className="w-0.5 h-3 bg-[#c97a3f] rounded-full" />
        </div>
      </div>
      <span className="text-[9px] font-mono text-[#c8b48f] tracking-widest">{label}</span>
    </div>
  )
}

function Reel({ spinning, reverse = false }: { spinning: boolean; reverse?: boolean }) {
  return (
    <div
      className={cx(
        'relative w-16 h-16 rounded-full era-bevel',
        spinning && (reverse ? 'animate-reel-spin' : 'animate-reel-spin')
      )}
      style={
        spinning
          ? reverse
            ? { animationDirection: 'reverse' }
            : undefined
          : undefined
      }
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 50% 50%,#221e1a 0%,#3a322a 60%,#6b4a2b 100%)',
          boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.4)'
        }}
      />
      {/* spokes */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 w-0.5 h-7 -mt-7 origin-bottom"
          style={{ transform: `translateX(-50%) rotate(${i * 60}deg)` }}
        >
          <div className="w-full h-full bg-[#c8b48f]/40 rounded-full" />
        </div>
      ))}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#c97a3f]" />
    </div>
  )
}

function VuMeter({ label, active, delay = 0 }: { label: string; active: boolean; delay?: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-8 h-12 rounded-era-sm bg-[#221e1a] overflow-hidden flex items-end p-1 gap-0.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cx(
              'flex-1 origin-bottom rounded-sm',
              active ? 'animate-vu-bounce' : 'scale-y-[0.2]'
            )}
            style={{
              height: '100%',
              background:
                i >= 3 ? '#c97a3f' : i >= 2 ? '#d9c9a8' : '#6b4a2b',
              animationDelay: `${delay + i * 90}ms`
            }}
          />
        ))}
      </div>
      <span className="text-[9px] font-mono text-[#c8b48f] tracking-widest">{label}</span>
    </div>
  )
}
