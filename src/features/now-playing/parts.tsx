import type { ReactNode } from 'react'
import { Heart, ListMusic, Mic2, Shuffle, SkipBack, SkipForward, Play, Pause, Repeat, Repeat1 } from 'lucide-react'
import type { Album, RepeatMode, Song } from '@/types'
import { cx } from '@/utils/format'

// ============================================================
// Shared player building blocks. Each era composes these into
// its own layout so controls stay FAMILIAR while the artwork
// transforms completely per era.
// ============================================================

export interface EraPlayerProps {
  song: Song
  album: Album | undefined
  isPlaying: boolean
  currentTime: number
  duration: number
  repeat: RepeatMode
  shuffle: boolean
  isFavourite: boolean
  onSeek: (sec: number) => void
  onTogglePlay: () => void
  onNext: () => void
  onPrev: () => void
  onToggleShuffle: () => void
  onCycleRepeat: () => void
  onToggleFavourite: () => void
  onOpenLyrics: () => void
  onOpenQueue: () => void
}

export function ControlButton({
  label,
  active = false,
  onClick,
  children,
  className
}: {
  label: string
  active?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx(
        'inline-flex items-center justify-center era-bevel rounded-eraPill transition-[transform,background-color,color,filter] duration-150 active:translate-y-px',
        active
          ? 'bg-era-accent-solid text-era-accent-contrast'
          : 'bg-transparent text-era-text hover:bg-era-surface-alt',
        className
      )}
    >
      {children}
    </button>
  )
}

export function PlayPauseButton({
  isPlaying,
  onToggle,
  size = 'lg'
}: {
  isPlaying: boolean
  onToggle: () => void
  size?: 'md' | 'lg' | 'xl'
}) {
  const dims = {
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  } as const
  const icon = size === 'xl' ? 34 : size === 'lg' ? 28 : 22
  return (
    <button
      aria-label={isPlaying ? 'Pause' : 'Play'}
      onClick={onToggle}
      className={cx(
        'inline-flex items-center justify-center era-bevel rounded-eraPill',
        'bg-era-accent-solid text-era-accent-contrast',
        'transition-transform duration-150 active:scale-95',
        dims[size]
      )}
    >
      {isPlaying ? <Pause size={icon} fill="currentColor" /> : <Play size={icon} fill="currentColor" />}
    </button>
  )
}

export function SecondaryActions({
  isFavourite,
  onToggleFavourite,
  onOpenLyrics,
  onOpenQueue,
  repeat,
  onCycleRepeat,
  shuffle,
  onToggleShuffle
}: {
  isFavourite: boolean
  onToggleFavourite: () => void
  onOpenLyrics: () => void
  onOpenQueue: () => void
  repeat: RepeatMode
  onCycleRepeat: () => void
  shuffle: boolean
  onToggleShuffle: () => void
}) {
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat
  return (
    <div className="flex items-center justify-center gap-2">
      <ControlButton label="Shuffle" active={shuffle} onClick={onToggleShuffle} className="w-10 h-10">
        <Shuffle size={18} />
      </ControlButton>
      <ControlButton
        label="Repeat"
        active={repeat !== 'off'}
        onClick={onCycleRepeat}
        className="w-10 h-10"
      >
        <RepeatIcon size={18} />
      </ControlButton>
      <ControlButton
        label={isFavourite ? 'Remove favourite' : 'Add favourite'}
        active={isFavourite}
        onClick={onToggleFavourite}
        className="w-10 h-10"
      >
        <Heart size={18} fill={isFavourite ? 'currentColor' : 'none'} />
      </ControlButton>
      <ControlButton label="Lyrics" onClick={onOpenLyrics} className="w-10 h-10">
        <Mic2 size={18} />
      </ControlButton>
      <ControlButton label="Queue" onClick={onOpenQueue} className="w-10 h-10">
        <ListMusic size={18} />
      </ControlButton>
    </div>
  )
}

export { SkipBack, SkipForward }
