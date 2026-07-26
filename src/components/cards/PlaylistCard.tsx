import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Sparkles } from 'lucide-react'
import type { Playlist } from '@/types'
import { AlbumArt } from '@/components/ui/AlbumArt'
import { cx } from '@/utils/format'

// ============================================================
// PlaylistCard — wide featured card for a playlist, or a
// standard card when `wide` is false.
// ============================================================

export function PlaylistCard({
  playlist,
  wide = false,
  onPlay
}: {
  playlist: Playlist
  wide?: boolean
  onPlay: () => void
}) {
  const navigate = useNavigate()

  if (wide) {
    return (
      <motion.button
        type="button"
        onClick={onPlay}
        whileTap={{ scale: 0.98 }}
        className="w-full snap-start text-left"
      >
        <div
          className={cx(
            'relative overflow-hidden rounded-eraLg era-bevel h-40 px-5 py-4 flex flex-col justify-between',
            'ring-1 ring-black/5'
          )}
          style={{ background: playlist.cover }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-white/90 bg-black/25 px-2 py-1 rounded-eraPill">
              <Sparkles size={12} /> Featured
            </span>
          </div>
          <div className="relative text-white">
            <p className="font-display text-2xl leading-tight drop-shadow">{playlist.title}</p>
            <p className="text-[12px] opacity-90 line-clamp-1">{playlist.description}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-body">
              <Play size={14} fill="currentColor" /> Play playlist
            </span>
          </div>
        </div>
      </motion.button>
    )
  }

  return (
    <div className="w-40 shrink-0 snap-start">
      <AlbumArt
        cover={playlist.cover}
        alt={playlist.title}
        size="full"
        onClick={onPlay ?? (() => navigate('/now-playing'))}
      />
      <p className="mt-2 truncate font-body text-[14px] text-era-text leading-tight">
        {playlist.title}
      </p>
      <p className="truncate text-[12px] text-era-text-muted leading-tight">
        {playlist.songIds.length} songs
      </p>
    </div>
  )
}
