import { useNavigate } from 'react-router-dom'
import type { Album } from '@/types'
import { AlbumArt } from '@/components/ui/AlbumArt'

// ============================================================
// AlbumCard — large, tappable album artwork with minimal text.
// Enlarges gently on hover/tap (handled inside AlbumArt).
// ============================================================

export function AlbumCard({
  album,
  subtitle,
  width = 'md',
  onPlay
}: {
  album: Album
  subtitle?: string
  width?: 'sm' | 'md' | 'lg'
  onPlay?: () => void
}) {
  const navigate = useNavigate()
  const widths = {
    sm: 'w-36',
    md: 'w-44',
    lg: 'w-56'
  } as const

  return (
    <div className={widths[width] + ' shrink-0'}>
      <AlbumArt
        cover={album.cover}
        alt={`${album.title} — ${album.artist}`}
        size="full"
        onClick={onPlay ?? (() => navigate('/now-playing'))}
      />
      <div className="mt-2 px-0.5">
        <p className="truncate font-body text-[14px] text-era-text leading-tight">
          {album.title}
        </p>
        <p className="truncate text-[12px] text-era-text-muted leading-tight">
          {subtitle ?? album.artist}
        </p>
      </div>
    </div>
  )
}
