import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  SkipBack, SkipForward, Rewind, FastForward,
  Shuffle, Repeat, Repeat1, Heart, Mic2, ListMusic, Images
} from 'lucide-react'
import { formatTime, cx } from '@/utils/format'
import { usePlayerStore } from '@/store/playerStore'
import { useLibraryStore } from '@/store/libraryStore'
import type { EraPlayerProps } from '../parts'
import type { Song } from '@/types'

function seekFromEvent(e: React.MouseEvent<HTMLDivElement>, duration: number, onSeek: (s: number) => void) {
  const rect = e.currentTarget.getBoundingClientRect()
  const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  onSeek(pct * duration)
}

// --- Subtle click-clack via Web Audio ---
let clickCtx: AudioContext | null = null

function clickSound() {
  try {
    if (!clickCtx) clickCtx = new AudioContext()
    if (clickCtx.state === 'suspended') clickCtx.resume()
    const t = clickCtx.currentTime
    const osc = clickCtx.createOscillator()
    const gain = clickCtx.createGain()
    const vol = 0.012
    gain.gain.setValueAtTime(vol, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03)
    osc.frequency.setValueAtTime(1800, t)
    osc.frequency.exponentialRampToValueAtTime(250, t + 0.025)
    osc.type = 'triangle'
    osc.connect(gain)
    gain.connect(clickCtx.destination)
    osc.start(t)
    osc.stop(t + 0.03)
  } catch { /* audio unavailable */ }
}

// ============================================================
// Cassette Era — premium late-80s Walkman
//
// A physically-realistic portable cassette player with brushed
// aluminium chassis, smoked-glass cassette window, authentic
// reel/tape mechanism, and hardware-integrated controls.
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
    onOpenQueue,
    hasMemory,
    onOpenMemory
  } = props

  const volume = usePlayerStore((s) => s.volume)
  const setVolume = usePlayerStore((s) => s.setVolume)

  const pct = duration ? (currentTime / duration) * 100 : 0
  const [seekDir, setSeekDir] = useState<'ff' | 'rw' | null>(null)
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeRef = useRef(currentTime)
  timeRef.current = currentTime

  const startSeek = (dir: 'ff' | 'rw') => {
    setSeekDir(dir)
    const step = () => {
      const t = dir === 'ff' ? Math.min(duration, timeRef.current + 10) : Math.max(0, timeRef.current - 10)
      onSeek(t)
    }
    step()
    holdTimer.current = setInterval(step, 220)
  }
  const stopSeek = () => {
    setSeekDir(null)
    if (holdTimer.current) clearInterval(holdTimer.current)
    holdTimer.current = null
  }
  useEffect(() => () => stopSeek(), [])

  const normalizedAlbum = album ? { ...album, cover: album.cover || 'linear-gradient(135deg, #6b4a2b, #221e1a)' } : undefined
  const displayedDuration = duration || song?.durationSec || 0
  const progress = displayedDuration > 0 ? currentTime / displayedDuration : 0

  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat

  const handleClick = useCallback((fn?: () => void) => {
    clickSound()
    fn?.()
  }, [])

  return (
    <div className="px-3 pt-1 pb-6 flex flex-col items-center w-full max-w-sm mx-auto select-none">
      {/* ===== Walkman chassis ===== */}
      <motion.div
        layout
        className="relative w-full overflow-hidden rounded-[14px]"
        style={{
          background: [
            'linear-gradient(170deg, #3a3a3e 0%, #2c2c30 40%, #1e1e22 100%)',
          ].join(', '),
          boxShadow: [
            '0 26px 52px rgba(0,0,0,0.6)',
            'inset 0 1px 0 rgba(255,255,255,0.06)',
            'inset 0 -1px 0 rgba(0,0,0,0.5)'
          ].join(', '),
          border: '1px solid rgba(0,0,0,0.5)'
        }}
      >
        {/* Brushed aluminium top cap */}
        <div
          className="absolute top-0 inset-x-0 h-[52px]"
          style={{
            background: [
              'repeating-linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.02) 1px, transparent 2px, transparent 4px)',
              'linear-gradient(180deg, #4a4a4e 0%, #38383c 100%)'
            ].join(', '),
            borderBottom: '1px solid rgba(0,0,0,0.4)'
          }}
        />

        {/* Screws */}
        <Screw cx={8} cy={8} />
        <Screw cx={8} cy="calc(100% - 8px)" />
        <Screw cx="calc(100% - 8px)" cy={8} />
        <Screw cx="calc(100% - 8px)" cy="calc(100% - 8px)" />

        {/* ===== Top: volume + brand + LED ===== */}
        <div className="relative z-10 flex items-center justify-between px-3 pt-2.5 pb-2" style={{ height: 52 }}>
          {/* Volume knob */}
          <div className="flex items-center gap-1.5">
            <VolumeKnob volume={volume} onChange={setVolume} />
          </div>
          {/* Brand engraving */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono tracking-[0.35em] text-[#a89f8a] uppercase">Akoustix</span>
            <span className="text-[7px] font-mono text-[#8a7a5a] uppercase tracking-[0.2em]">Walkman</span>
          </div>
          {/* LED indicator */}
          <LED active={isPlaying} />
        </div>

        {/* ===== Cassette window (smoked acrylic) ===== */}
        <div className="relative mx-3 mt-1 overflow-hidden rounded-[10px]" style={{ minHeight: 200 }}>
          {/* Smoked glass base */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(170deg, rgba(20,20,24,0.92), rgba(12,12,16,0.98))',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.04)',
              border: '1px solid rgba(0,0,0,0.5)'
            }}
          />
          {/* Glass glare reflection (subtle, always on) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(170deg, rgba(255,255,255,0.04) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.02) 100%)'
            }}
          />
          {/* Dynamic reflection sweep */}
          {isPlaying && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
                  animation: 'sheen 3s ease-in-out infinite'
                }}
              />
            </div>
          )}

          {/* Cassette shell */}
          <div className="relative z-10 p-3 pt-4 pb-3">
            {/* Printed label — album art occupies the full label area */}
            <div
              className="relative rounded-[6px] overflow-hidden mb-3"
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
                border: '1px solid rgba(0,0,0,0.3)'
              }}
            >
              <CassetteLabel
                cover={normalizedAlbum?.cover}
                title={song?.title}
                artist={song?.artist}
                album={normalizedAlbum?.title}
              />
            </div>

            {/* Reel mechanism */}
            <div className="relative flex items-center justify-between h-[86px] px-1">
              {/* Left reel (supply) */}
              <Reel
                side="left"
                progress={progress}
                spinning={isPlaying || seekDir === 'rw'}
                fast={seekDir === 'rw'}
              />
              {/* Tape path with guide rollers */}
              <div className="flex-1 mx-2 relative flex flex-col items-center justify-between h-full py-1">
                {/* Upper tape path */}
                <div className="w-full flex-1 relative">
                  {/* Tape strip */}
                  <div
                    className="absolute top-1/2 left-0 right-0 h-[6px] -translate-y-1/2 rounded-full overflow-hidden"
                    style={{
                      background: 'rgba(30,26,22,0.8)',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.7)'
                    }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300"
                      style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #c97a3f, #d9a05a)',
                        boxShadow: '0 0 6px rgba(201,122,63,0.5)'
                      }}
                    />
                    {/* Moving tape texture */}
                    {isPlaying && (
                      <div
                        className="absolute inset-0 opacity-25"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(90deg, rgba(243,232,207,0.4) 0 3px, transparent 3px 8px)',
                          backgroundSize: '16px 100%',
                          animation: 'tape-move 0.5s linear infinite'
                        }}
                      />
                    )}
                  </div>
                </div>
                {/* Guide roller row */}
                <div className="flex items-center justify-between w-full mt-auto">
                  <GuideRoller />
                  <GuideRoller />
                </div>
              </div>
              {/* Right reel (take-up) */}
              <Reel
                side="right"
                progress={progress}
                spinning={isPlaying || seekDir === 'ff'}
                fast={seekDir === 'ff'}
              />
            </div>
          </div>
        </div>

        {/* ===== Info display panel (engraved metal) ===== */}
        <InfoPanel
          title={song?.title}
          artist={song?.artist}
          album={normalizedAlbum?.title}
          currentTime={currentTime}
          duration={displayedDuration}
          isPlaying={isPlaying}
        />

        {/* ===== Transport buttons ===== */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <TransportButton label="Previous" size={42} onClick={() => handleClick(onPrev)}>
              <SkipBack size={18} fill="currentColor" />
            </TransportButton>
            <TransportButton
              label="Rewind"
              size={38}
              onClick={() => handleClick(() => onSeek(Math.max(0, currentTime - 10)))}
              onPointerDown={() => startSeek('rw')}
              onPointerUp={stopSeek}
              onPointerLeave={stopSeek}
            >
              <Rewind size={16} />
            </TransportButton>
            <PlayPauseButton isPlaying={isPlaying} onToggle={() => handleClick(onTogglePlay)} />
            <TransportButton
              label="Fast Forward"
              size={38}
              onClick={() => handleClick(() => onSeek(Math.min(displayedDuration, currentTime + 10)))}
              onPointerDown={() => startSeek('ff')}
              onPointerUp={stopSeek}
              onPointerLeave={stopSeek}
            >
              <FastForward size={16} />
            </TransportButton>
            <TransportButton label="Next" size={42} onClick={() => handleClick(onNext)}>
              <SkipForward size={18} fill="currentColor" />
            </TransportButton>
          </div>
        </div>

        {/* ===== Contact strip (seek) ===== */}
        <div className="px-4 pb-1">
          <div
            className="relative h-2 rounded-full cursor-pointer"
            style={{
              background: 'rgba(200,180,143,0.08)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)'
            }}
            onClick={(e) => seekFromEvent(e, displayedDuration, onSeek)}
          >
            <div
              className="absolute inset-y-[1px] left-[1px] rounded-full"
              style={{
                width: `calc(${pct}% - 2px)`,
                background: 'linear-gradient(90deg, #c97a3f, #d9a05a)',
                boxShadow: '0 0 4px rgba(201,122,63,0.3)'
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                left: `calc(${pct}% - 5px)`,
                background: 'radial-gradient(circle at 40% 35%, #f3e8cf, #c97a3f)',
                boxShadow: '0 0 6px rgba(201,122,63,0.5), inset 0 1px 0 rgba(255,255,255,0.3)'
              }}
            />
          </div>
        </div>

        {/* ===== Secondary hardware controls ===== */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center gap-1.5">
            <SwitchButton
              label="Shuffle"
              active={shuffle}
              onClick={() => handleClick(onToggleShuffle)}
            >
              <Shuffle size={15} />
            </SwitchButton>
            <SwitchButton
              label="Repeat"
              active={repeat !== 'off'}
              onClick={() => handleClick(onCycleRepeat)}
            >
              <RepeatIcon size={15} />
            </SwitchButton>
            <SwitchButton
              label={isFavourite ? 'Favourite' : 'Add favourite'}
              active={isFavourite}
              onClick={() => handleClick(onToggleFavourite)}
            >
              <Heart size={15} fill={isFavourite ? 'currentColor' : 'none'} />
            </SwitchButton>
            <SwitchButton
              label="Memory"
              active={hasMemory}
              onClick={() => handleClick(onOpenMemory)}
            >
              <Images size={15} />
            </SwitchButton>
            <SwitchButton
              label="Lyrics"
              active={false}
              onClick={() => handleClick(onOpenLyrics)}
            >
              <Mic2 size={15} />
            </SwitchButton>
            <SwitchButton
              label="Queue"
              active={false}
              onClick={() => handleClick(onOpenQueue)}
            >
              <ListMusic size={15} />
            </SwitchButton>
          </div>
        </div>

        {/* ===== Cassette Collection (browsing) ===== */}
        <CassetteCollection onPlay={handleClick} />
      </motion.div>
    </div>
  )
}

// ====================================================================
// Sub-components
// ====================================================================

function CassetteLabel({
  cover,
  title,
  artist,
  album
}: {
  cover?: string
  title?: string
  artist?: string
  album?: string
}) {
  const isImg = cover ? /^https?:\/\//i.test(cover) || cover.startsWith('/') : false
  return (
    <div className="relative" style={{ aspectRatio: '4 / 1' }}>
      {/* Background: album art or gradient */}
      {isImg ? (
        <img
          src={cover}
          alt={album ?? 'Album art'}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0" style={{ background: cover ?? 'linear-gradient(135deg, #4a3a2a, #2a1a0a)' }} />
      )}
      {/* Dark gradient overlay for readability */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.35) 100%)' }}
      />
      {/* Text layer */}
      <div className="absolute inset-0 flex items-center px-3">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-display text-white leading-tight truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            {title ?? '—'}
          </p>
          <p className="text-[10px] font-body text-white/80 leading-tight truncate mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            {artist}{album ? ` · ${album}` : ''}
          </p>
        </div>
      </div>
      {/* Subtle edge highlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.3)' }}
      />
    </div>
  )
}

function Reel({
  side,
  progress,
  spinning,
  fast
}: {
  side: 'left' | 'right'
  progress: number
  spinning: boolean
  fast: boolean
}) {
  // The supply reel (left) starts full and empties; take-up (right) fills.
  const tapeAmount = side === 'left' ? 1 - progress : progress
  const hubRadius = 6
  const maxTapeRadius = 22
  const tapeThickness = tapeAmount * (maxTapeRadius - hubRadius)
  const innerR = hubRadius
  const outerR = hubRadius + tapeThickness
  const rimR = maxTapeRadius + 4

  const dur = fast ? '0.5s' : '3s'
  const isReversing = side === 'left' && spinning && !fast
  const isFastReverse = side === 'left' && fast
  const isFastForward = side === 'right' && fast

  return (
    <div className="relative shrink-0" style={{ width: rimR * 2, height: rimR * 2 }}>
      {/* Reel shadow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)' }}
      />
      {/* Spinning container */}
      <div
        className={cx('absolute inset-0 rounded-full', spinning && 'animate-reel-spin')}
        style={{
          animationDuration: dur,
          animationDirection: (isReversing || isFastReverse) && !isFastForward ? 'reverse' : 'normal',
          animationPlayState: spinning ? 'running' : 'paused'
        }}
      >
        {/* Outer flange */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: [
              'radial-gradient(circle at 50% 50%, transparent 60%, rgba(60,55,48,0.3) 60%)',
              'conic-gradient(from 0deg, #3a322a, #4a3f32, #3a322a, #2e2823, #3a322a)'
            ].join(', '),
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)'
          }}
        />
        {/* Tape wound on hub */}
        {tapeThickness > 1 && (
          <div
            className="absolute rounded-full"
            style={{
              left: `calc(50% - ${outerR}px)`,
              top: `calc(50% - ${outerR}px)`,
              width: outerR * 2,
              height: outerR * 2,
              background: 'radial-gradient(circle at 50% 50%, #2a2218, #1a1410 70%, #2a2218)',
              boxShadow: `inset 0 0 0 ${outerR - innerR}px rgba(60,50,35,0.6)`
            }}
          >
            {/* Tape layer rings */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: [
                  'repeating-radial-gradient(circle at 50% 50%, transparent 0px, transparent 2px, rgba(80,70,55,0.15) 2px, rgba(80,70,55,0.15) 3px)'
                ].join(', ')
              }}
            />
          </div>
        )}
        {/* Hub core */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: hubRadius * 2,
            height: hubRadius * 2,
            background: 'radial-gradient(circle at 40% 35%, #5a4f3a, #2a2218)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
          }}
        >
          {/* Spindle hole */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60"
            style={{ width: 4, height: 4, boxShadow: 'inset 0 0 2px rgba(0,0,0,0.8)' }}
          />
        </div>
        {/* Spokes */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 origin-bottom"
            style={{
              width: 2,
              height: maxTapeRadius - 4,
              marginTop: -(maxTapeRadius - 4),
              transform: `translateX(-50%) rotate(${i * 90}deg)`,
              background: 'linear-gradient(180deg, rgba(200,180,143,0.15), rgba(200,180,143,0.05))'
            }}
          />
        ))}
      </div>
    </div>
  )
}

function GuideRoller() {
  return (
    <div
      className="relative rounded-full shrink-0"
      style={{
        width: 10,
        height: 10,
        background: 'radial-gradient(circle at 40% 35%, #8a7a6a, #4a3f32)',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.3)'
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: 3, height: 3, background: 'rgba(0,0,0,0.4)' }}
      />
    </div>
  )
}

function InfoPanel({
  title,
  artist,
  album,
  currentTime,
  duration,
  isPlaying
}: {
  title?: string
  artist?: string
  album?: string
  currentTime: number
  duration: number
  isPlaying: boolean
}) {
  return (
    <div
      className="mx-3 rounded-[8px] overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(16,16,20,0.95), rgba(10,10,14,0.98))',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04), 0 1px 4px rgba(0,0,0,0.3)',
        border: '1px solid rgba(0,0,0,0.4)'
      }}
    >
      <div className="px-3 py-2">
        {/* Title line */}
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              background: isPlaying ? '#c97a3f' : 'rgba(200,180,143,0.2)',
              boxShadow: isPlaying ? '0 0 6px rgba(201,122,63,0.6)' : 'none',
              transition: 'all 300ms ease'
            }}
          />
          <p className="flex-1 min-w-0 text-[13px] font-display text-[#e8dfcf] leading-tight truncate">
            {title ?? '—'}
          </p>
        </div>
        {/* Artist + album */}
        <p className="mt-0.5 text-[10px] font-body text-[#a89f8a] leading-tight truncate pl-[14px]">
          {artist ?? '—'}{album ? `  ·  ${album}` : ''}
        </p>
        {/* Time + progress */}
        <div className="mt-1.5 flex items-center justify-between pl-[14px]">
          <span className="text-[10px] font-mono text-[#c97a3f] tabular-nums tracking-wider">
            {formatTime(currentTime)}
          </span>
          <span className="text-[8px] font-mono text-[#6a6252] uppercase tracking-widest">
            {isPlaying ? 'Play' : 'Stop'}
          </span>
          <span className="text-[10px] font-mono text-[#6a6252] tabular-nums tracking-wider">
            {formatTime(Math.max(0, duration - currentTime))}
          </span>
        </div>
      </div>
    </div>
  )
}

// --- Buttons ---

function TransportButton({
  label,
  size = 42,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  children
}: {
  label: string
  size?: number
  onClick?: () => void
  onPointerDown?: () => void
  onPointerUp?: () => void
  onPointerLeave?: () => void
  children: React.ReactNode
}) {
  return (
    <motion.button
      aria-label={label}
      title={label}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      whileTap={{ scale: 0.9, y: 3, boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.6), inset 0 1px 2px rgba(0,0,0,0.4)' }}
      transition={{ type: 'spring', stiffness: 600, damping: 18 }}
      className="inline-flex items-center justify-center rounded-[6px]"
      style={{
        width: size,
        height: size,
        background: [
          'linear-gradient(160deg, #4a4a4e 0%, #3a3a3e 50%, #2e2e32 100%)'
        ].join(', '),
        color: '#d8d0c4',
        boxShadow: [
          'inset 0 1px 0 rgba(255,255,255,0.08)',
          'inset 0 -2px 4px rgba(0,0,0,0.3)',
          '0 3px 8px rgba(0,0,0,0.25)'
        ].join(', '),
        border: '1px solid rgba(0,0,0,0.35)'
      }}
    >
      {children}
    </motion.button>
  )
}

function PlayPauseButton({
  isPlaying,
  onToggle
}: {
  isPlaying: boolean
  onToggle: () => void
}) {
  return (
    <motion.button
      aria-label={isPlaying ? 'Pause' : 'Play'}
      onClick={onToggle}
      whileTap={{ scale: 0.88, y: 3, boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.6)' }}
      transition={{ type: 'spring', stiffness: 600, damping: 18 }}
      className="inline-flex items-center justify-center rounded-[8px]"
      style={{
        width: 52,
        height: 52,
        background: [
          'linear-gradient(160deg, #d97a2f 0%, #c96a1f 45%, #b85a0f 100%)'
        ].join(', '),
        color: '#f3e8cf',
        boxShadow: [
          'inset 0 1px 0 rgba(255,255,255,0.2)',
          'inset 0 -2px 6px rgba(0,0,0,0.3)',
          '0 4px 14px rgba(201,122,63,0.3)'
        ].join(', '),
        border: '1px solid rgba(0,0,0,0.35)'
      }}
    >
      {isPlaying ? (
        <span className="flex gap-[5px] items-center" style={{ width: 20, height: 20 }}>
          <span className="w-[5px] h-full bg-current rounded-[2px]" />
          <span className="w-[5px] h-full bg-current rounded-[2px]" />
        </span>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="7,4 20,12 7,20" />
        </svg>
      )}
    </motion.button>
  )
}

function SwitchButton({
  label,
  active,
  onClick,
  children
}: {
  label: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <motion.button
      aria-label={label}
      title={label}
      onClick={onClick}
      whileTap={{ scale: 0.9, y: 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      className="inline-flex items-center justify-center rounded-[5px]"
      style={{
        width: 34,
        height: 30,
        background: active
          ? 'linear-gradient(160deg, #c97a3f 0%, #b85a1a 100%)'
          : 'linear-gradient(160deg, #3a3a3e 0%, #2e2e32 100%)',
        color: active ? '#f3e8cf' : '#6a6252',
        boxShadow: active
          ? 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 2px rgba(0,0,0,0.3), 0 2px 6px rgba(201,122,63,0.2)'
          : 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
        border: active ? '1px solid rgba(0,0,0,0.25)' : '1px solid rgba(0,0,0,0.3)'
      }}
    >
      {children}
    </motion.button>
  )
}

function VolumeKnob({
  volume,
  onChange
}: {
  volume: number
  onChange: (v: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()

    const update = (ev: PointerEvent) => {
      const x = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
      onChange(x)
    }

    update(e.nativeEvent as unknown as PointerEvent)

    const onMove = (ev: PointerEvent) => update(ev)
    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  const icon = volume === 0 ? 'VolumeX' : volume < 0.5 ? 'Volume1' : 'Volume2'

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[#6a6252]" style={{ fontSize: 14 }}>
        {icon === 'VolumeX' ? '🔇' : icon === 'Volume1' ? '🔉' : '🔊'}
      </span>
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        className="relative cursor-pointer"
        style={{ width: 44, height: 4 }}
      >
        {/* Track bg */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: 'rgba(0,0,0,0.4)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)' }}
        />
        {/* Track fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${volume * 100}%`,
            background: 'linear-gradient(90deg, #c97a3f, #d9a05a)'
          }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `calc(${volume * 100}% - 5px)`,
            width: 10,
            height: 10,
            background: 'radial-gradient(circle at 40% 35%, #e8dfcf, #a89f8a)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
          }}
        />
      </div>
    </div>
  )
}

function LED({ active }: { active: boolean }) {
  return (
    <div
      className="rounded-full"
      style={{
        width: 7,
        height: 7,
        background: active
          ? 'radial-gradient(circle at 40% 35%, #ff6a2a, #c94a0a)'
          : 'radial-gradient(circle at 40% 35%, #3a3a2a, #1a1a10)',
        boxShadow: active
          ? '0 0 6px rgba(255,106,42,0.6), inset 0 0 4px rgba(255,255,255,0.2)'
          : 'inset 0 0 2px rgba(0,0,0,0.4)',
        transition: 'all 300ms ease'
      }}
    />
  )
}

// ====================================================================
// Cassette Collection — browse your library as vintage cassette tapes.
// Each song appears as an individual tape card with realistic styling.
// ====================================================================

function CassetteCollection({ onPlay }: { onPlay: (fn?: () => void) => void }) {
  const songs = useLibraryStore((s) => s.songs)
  const albums = useLibraryStore((s) => s.albums)
  const playSong = usePlayerStore((s) => s.playSong)

  if (!songs.length) return null

  return (
    <div className="px-3 pb-4">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#8a7a5a]">
          Tape Collection
        </h3>
        <span className="text-[8px] font-mono text-[#6a6252]">{songs.length} cassettes</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
        {songs.map((s) => {
          const album = albums.find((a) => a.id === s.albumId)
          return (
            <CassetteTapeCard
              key={s.id}
              song={s}
              cover={album?.cover}
              onPlay={() => onPlay(() => playSong(s, songs))}
            />
          )
        })}
      </div>
    </div>
  )
}

function CassetteTapeCard({
  song,
  cover,
  onPlay
}: {
  song: Song
  cover?: string
  onPlay: () => void
}) {
  const isImg = cover ? /^https?:\/\//i.test(cover) || cover.startsWith('/') : false
  const rot = (Math.random() - 0.5) * 1.2

  return (
    <motion.button
      onClick={onPlay}
      whileHover={{ scale: 1.04, y: -4, rotate: 0 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="snap-start shrink-0 focus:outline-none text-left"
      style={{ width: 120 }}
    >
      <div
        className="relative rounded-[6px] overflow-hidden"
        style={{
          transform: `rotate(${rot}deg)`,
          background: 'linear-gradient(160deg, #3a322a 0%, #2e2823 50%, #221e1a 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          border: '1px solid rgba(0,0,0,0.3)'
        }}
      >
        {/* Label background */}
        <div className="relative" style={{ aspectRatio: '4 / 3' }}>
          {isImg ? (
            <img
              src={cover}
              alt={song.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0" style={{ background: cover ?? 'linear-gradient(135deg, #4a3a2a, #2a1a0a)' }} />
          )}
          {/* Overlay for readability */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.5) 100%)' }} />

          {/* Label text area */}
          <div className="absolute inset-0 flex flex-col justify-between p-2">
            <div className="flex items-center gap-1">
              <div
                className="w-[4px] h-[4px] rounded-full"
                style={{ background: 'rgba(243,232,207,0.3)' }}
              />
              <span className="text-[6px] font-mono tracking-[0.2em] uppercase text-[#c8b48f]">
                Side A
              </span>
            </div>
            <div>
              <p className="text-[10px] font-display text-white leading-tight truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                {song.title}
              </p>
              <p className="text-[7px] font-body text-white/70 leading-tight truncate mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                {song.artist}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom cassette detail strip */}
        <div
          className="px-2 py-1.5 flex items-center justify-between"
          style={{
            background: 'linear-gradient(180deg, #2e2823, #1e1a16)',
            borderTop: '1px solid rgba(0,0,0,0.3)'
          }}
        >
          {/* Tape window */}
          <div
            className="rounded-[3px] overflow-hidden"
            style={{
              width: 36,
              height: 14,
              background: 'rgba(12,10,8,0.8)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6)'
            }}
          >
            <div
              className="w-full h-full"
              style={{
                background: 'repeating-linear-gradient(90deg, transparent 0px, rgba(60,50,35,0.3) 2px, transparent 4px)'
              }}
            />
          </div>
          {/* Reel hub detail */}
          <div className="flex items-center gap-1">
            <div
              className="rounded-full"
              style={{ width: 6, height: 6, background: 'radial-gradient(circle at 40% 35%, #4a3f32, #2a2218)', boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.3)' }}
            />
            <span className="text-[5px] font-mono text-[#6a6252] tracking-wider">← →</span>
            <div
              className="rounded-full"
              style={{ width: 6, height: 6, background: 'radial-gradient(circle at 40% 35%, #4a3f32, #2a2218)', boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.3)' }}
            />
          </div>
        </div>

        {/* Edge highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)' }}
        />
      </div>
    </motion.button>
  )
}

function Screw({ cx: x, cy: y }: { cx: number | string; cy: number | string }) {
  return (
    <div
      className="absolute z-20 rounded-full pointer-events-none"
      style={{
        left: typeof x === 'number' ? x : x,
        top: typeof y === 'number' ? y : y,
        width: 7,
        height: 7,
        background: 'radial-gradient(circle at 35% 30%, #8a8a8a, #4a4a4a 60%, #2a2a2a 100%)',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.5)'
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50"
        style={{ width: 5, height: 1.5, transform: 'translate(-50%, -50%) rotate(45deg)' }}
      />
    </div>
  )
}
