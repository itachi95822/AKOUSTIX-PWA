import { motion } from 'framer-motion'
import { SkipBack, SkipForward, X, Minus, Square } from 'lucide-react'
import { formatTime, cx } from '@/utils/format'
import { ControlButton, PlayPauseButton, SecondaryActions, type EraPlayerProps } from '../parts'

function seekFromEvent(e: React.MouseEvent<HTMLDivElement>, duration: number, onSeek: (s: number) => void) {
  const rect = e.currentTarget.getBoundingClientRect()
  const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  onSeek(pct * duration)
}

// ============================================================
// Computer Era player — a classic desktop media player window:
// title bar with control box, beveled album preview, chunky
// progress, beveled buttons and a status bar. Pixel font via
// the era `--era-font-display` (VT323).
// ============================================================

export function ComputerPlayer(props: EraPlayerProps) {
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

  const pct = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="px-3 pt-2 pb-6 flex flex-col items-center">
      <motion.div
        layout
        className="relative w-full era-bevel"
        style={{
          background: '#c0c0c0',
          borderRadius: 0,
          boxShadow: '2px 2px 0 #404040'
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-1.5 py-1"
          style={{
            background: 'linear-gradient(90deg,#000080 0%,#1084d0 100%)',
            color: '#ffffff'
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[16px] leading-none">🎵</span>
            <span className="font-display text-[18px] leading-none tracking-wide">
              Now Playing — Akoustix Media Player
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <WinBtn label="Minimize"><Minus size={12} /></WinBtn>
            <WinBtn label="Maximize"><Square size={11} /></WinBtn>
            <WinBtn label="Close" danger><X size={13} /></WinBtn>
          </div>
        </div>

        {/* Menu bar */}
        <div className="flex gap-3 px-2 py-0.5 font-display text-[16px] text-black/90">
          {['File', 'Edit', 'View', 'Options', 'Help'].map((m) => (
            <span key={m} className="leading-none">
              <span className="underline">{m[0]}</span>
              {m.slice(1)}
            </span>
          ))}
        </div>

        {/* Body */}
        <div className="p-3">
          {/* Album preview + info */}
          <div className="flex gap-3">
            <div
              className="w-28 h-28 shrink-0 era-bevel flex items-center justify-center"
              style={{ background: album?.cover ?? '#808080' }}
            >
              <span className="text-[28px] leading-none drop-shadow">💿</span>
            </div>
            <div className="min-w-0 flex-1 font-display text-black">
              <div className="mb-1">
                <Label>Title</Label>
                <Value>{song.title}</Value>
              </div>
              <div className="mb-1">
                <Label>Artist</Label>
                <Value>{song.artist}</Value>
              </div>
              <div>
                <Label>Album</Label>
                <Value>{album?.title}</Value>
              </div>
            </div>
          </div>

          {/* Status display */}
          <div
            className="mt-3 px-2 py-1 font-display text-[18px] text-[#00ff00] tracking-widest"
            style={{
              background: '#000000',
              boxShadow: 'inset 1px 1px 0 #404040',
              borderRadius: 0
            }}
          >
            {isPlaying ? '▶ PLAYING' : '■ PAUSED'} — {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Chunky progress */}
          <div className="mt-3">
            <div className="flex justify-between font-display text-[15px] text-black mb-0.5">
              <span>Position</span>
              <span className="tabular-nums">{Math.round(pct)}%</span>
            </div>
            <div
              className="relative h-4 cursor-pointer"
              style={{
                background: '#ffffff',
                boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #ffffff',
                borderRadius: 0
              }}
              onClick={(e) => seekFromEvent(e, duration, onSeek)}
            >
              <div
                className="absolute inset-y-0.5 left-0.5"
                style={{
                  width: `calc(${pct}% - 4px)`,
                  background:
                    'repeating-linear-gradient(90deg,#000080 0,#000080 6px,#1084d0 6px,#1084d0 12px)',
                  borderRadius: 0
                }}
              />
            </div>
          </div>

          {/* Transport */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <WinCtrlBtn label="Previous" onClick={onPrev}>
              <SkipBack size={18} fill="currentColor" />
            </WinCtrlBtn>
            <WinCtrlBtn label="Play/Pause" primary onClick={onTogglePlay} className="w-16 h-12">
              <span className="font-display text-[20px] leading-none">
                {isPlaying ? '❚❚' : '▶'}
              </span>
            </WinCtrlBtn>
            <WinCtrlBtn label="Next" onClick={onNext}>
              <SkipForward size={18} fill="currentColor" />
            </WinCtrlBtn>
          </div>

          {/* Secondary actions as a beveled toolbar */}
          <div
            className="mt-3 p-1 flex items-center justify-center gap-1"
            style={{ boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #ffffff' }}
          >
            <SecondaryActions
              isFavourite={isFavourite}
              onToggleFavourite={onToggleFavourite}
              onOpenLyrics={onOpenLyrics}
              onOpenQueue={onOpenQueue}
              repeat={repeat}
              onCycleRepeat={onCycleRepeat}
              shuffle={shuffle}
              onToggleShuffle={onToggleShuffle}
              hasMemory={hasMemory}
              onOpenMemory={onOpenMemory}
            />
          </div>
        </div>

        {/* Status bar */}
        <div
          className="flex items-center justify-between px-1.5 py-0.5 font-display text-[14px] text-black"
          style={{ boxShadow: 'inset 1px 1px 0 #808080' }}
        >
          <span>Era: Computer</span>
          <span className="flex items-center gap-2">
            <span>{shuffle ? 'SHUF' : '---'}</span>
            <span>REP: {repeat === 'off' ? 'OFF' : repeat === 'all' ? 'ALL' : 'ONE'}</span>
            <span className="era-bevel px-1">OK</span>
          </span>
        </div>
      </motion.div>
    </div>
  )
}

function WinBtn({
  children,
  label,
  danger
}: {
  children: React.ReactNode
  label: string
  danger?: boolean
}) {
  return (
    <button
      aria-label={label}
      className="w-5 h-5 flex items-center justify-center text-black text-[12px] font-bold"
      style={{
        background: '#c0c0c0',
        color: danger ? '#a00000' : '#000000',
        boxShadow: 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080'
      }}
    >
      {children}
    </button>
  )
}

function WinCtrlBtn({
  children,
  label,
  onClick,
  primary,
  className
}: {
  children: React.ReactNode
  label: string
  onClick?: () => void
  primary?: boolean
  className?: string
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={cx('flex items-center justify-center', className ?? 'w-12 h-12')}
      style={{
        background: primary ? '#000080' : '#c0c0c0',
        color: primary ? '#ffffff' : '#000000',
        boxShadow: 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080'
      }}
    >
      {children}
    </button>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[15px] text-black/60 mr-1">{children}:</span>
}
function Value({ children }: { children: React.ReactNode }) {
  return <span className="text-[16px] text-black">{children}</span>
}

// Re-export to keep shared control types referenced.
export { ControlButton, PlayPauseButton }
