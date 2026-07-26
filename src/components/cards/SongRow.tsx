import { Heart, Play, Pause, MoreHorizontal } from 'lucide-react'
import type { Song } from '@/types'
import { AlbumArt } from '@/components/ui/AlbumArt'
import { usePlayerStore } from '@/store/playerStore'
import { useAlbumById } from '@/store/libraryStore'
import { cx, formatTime } from '@/utils/format'

// ============================================================
// SongRow — a single track row used by Search, Library and
// the Now Playing queue. Tapping plays it; the heart toggles
// favourite. Shows as currently playing when active.
// ============================================================

export function SongRow({
  song,
  index,
  onPlay,
  showArt = true,
  showIndex = false
}: {
  song: Song
  index?: number
  onPlay: () => void
  showArt?: boolean
  showIndex?: boolean
}) {
  const album = useAlbumById(song.albumId)
  const currentSongId = usePlayerStore((s) => s.queue[s.index]?.id)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const toggleFavourite = usePlayerStore((s) => s.toggleFavourite)
  const favourites = usePlayerStore((s) => s.favourites)

  const isCurrent = currentSongId === song.id
  const isFav = favourites.includes(song.id)

  return (
    <div
      className={cx(
        'group flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors rounded-era',
        isCurrent ? 'bg-era-surface-alt' : 'hover:bg-era-surface-alt/60'
      )}
      onClick={onPlay}
    >
      {showIndex && (
        <span className="w-5 text-right text-[13px] font-mono text-era-text-muted tabular-nums">
          {index ?? ''}
        </span>
      )}
      {showArt && (
        <AlbumArt cover={album?.cover ?? '#444'} alt={album?.title ?? ''} size="sm" />
      )}
      <div className="min-w-0 flex-1">
        <p
          className={cx(
            'truncate font-body text-[15px] leading-tight',
            isCurrent ? 'text-era-accent-solid' : 'text-era-text'
          )}
        >
          {song.title}
        </p>
        <p className="truncate text-[12px] text-era-text-muted leading-tight">
          {song.artist}
        </p>
      </div>
      <span className="text-[12px] font-mono text-era-text-muted tabular-nums shrink-0">
        {formatTime(song.durationSec)}
      </span>
      <button
        aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
        onClick={(e) => {
          e.stopPropagation()
          toggleFavourite(song.id)
        }}
        className={cx(
          'w-8 h-8 inline-flex items-center justify-center rounded-eraPill transition-colors',
          isFav ? 'text-era-accent-solid' : 'text-era-text-muted hover:text-era-text'
        )}
      >
        <Heart size={17} fill={isFav ? 'currentColor' : 'none'} />
      </button>
      <button
        aria-label="More options"
        onClick={(e) => e.stopPropagation()}
        className="w-8 h-8 hidden sm:inline-flex items-center justify-center rounded-eraPill text-era-text-muted hover:text-era-text"
      >
        {isCurrent && isPlaying ? <Pause size={16} fill="currentColor" /> : <MoreHorizontal size={18} />}
      </button>
      <button
        aria-label="Play"
        onClick={(e) => {
          e.stopPropagation()
          onPlay()
        }}
        className="w-8 h-8 inline-flex items-center justify-center rounded-eraPill text-era-text hover:text-era-accent-solid"
      >
        <Play size={17} fill="currentColor" />
      </button>
    </div>
  )
}
