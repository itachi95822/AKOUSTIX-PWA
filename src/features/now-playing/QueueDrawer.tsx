import { motion, AnimatePresence } from 'framer-motion'
import { X, ListMusic, Trash2 } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { useAlbumById } from '@/store/libraryStore'
import { AlbumArt } from '@/components/ui/AlbumArt'
import { formatTime, cx } from '@/utils/format'

// ============================================================
// QueueDrawer — slide-up panel showing the current play queue.
// Tap a row to jump; the now-playing row is highlighted.
// ============================================================

export function QueueDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queue = usePlayerStore((s) => s.queue)
  const index = usePlayerStore((s) => s.index)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const clearQueue = usePlayerStore((s) => s.clearQueue)

  const jumpTo = (i: number) => {
    usePlayerStore.setState({ index: i, currentTime: 0, isPlaying: true })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-[480px] mx-auto max-h-[75dvh] flex flex-col bg-era-surface rounded-t-eraLg border-t border-era-border"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-era-border">
              <div className="flex items-center gap-2">
                <ListMusic size={18} className="text-era-accent-solid" />
                <h3 className="font-display text-xl text-era-text">Queue</h3>
                <span className="text-[12px] font-mono text-era-text-muted">
                  {queue.length} track{queue.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  aria-label="Clear queue"
                  onClick={clearQueue}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-eraPill text-era-text-muted hover:text-era-text"
                >
                  <Trash2 size={17} />
                </button>
                <button
                  aria-label="Close queue"
                  onClick={onClose}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-eraPill text-era-text-muted hover:text-era-text"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto era-scroll p-2">
              {queue.length === 0 ? (
                <p className="px-4 py-10 text-center text-[14px] text-era-text-muted">
                  The queue is empty. Play something from Home, Search or Library.
                </p>
              ) : (
                <ul>
                  {queue.map((song, i) => (
                    <QueueRow
                      key={`${song.id}-${i}`}
                      songId={song.id}
                      title={song.title}
                      artist={song.artist}
                      albumId={song.albumId}
                      duration={song.durationSec}
                      isCurrent={i === index}
                      isPlaying={i === index && isPlaying}
                      onJump={() => jumpTo(i)}
                    />
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function QueueRow({
  songId,
  title,
  artist,
  albumId,
  duration,
  isCurrent,
  isPlaying,
  onJump
}: {
  songId: string
  title: string
  artist: string
  albumId: string
  duration: number
  isCurrent: boolean
  isPlaying: boolean
  onJump: () => void
}) {
  const album = useAlbumById(albumId)
  const fav = usePlayerStore((s) => s.favourites.includes(songId))
  return (
    <li>
      <button
        onClick={onJump}
        className={cx(
          'w-full flex items-center gap-3 px-2 py-2 rounded-era text-left transition-colors',
          isCurrent ? 'bg-era-surface-alt' : 'hover:bg-era-surface-alt/60'
        )}
      >
        <AlbumArt cover={album?.cover ?? '#444'} alt={album?.title ?? ''} size="sm" />
        <div className="min-w-0 flex-1">
          <p
            className={cx(
              'truncate font-body text-[15px] leading-tight',
              isCurrent ? 'text-era-accent-solid' : 'text-era-text'
            )}
          >
            {title}
            {fav && <span className="ml-1 text-era-accent-solid">♥</span>}
          </p>
          <p className="truncate text-[12px] text-era-text-muted leading-tight">{artist}</p>
        </div>
        <span className="text-[12px] font-mono text-era-text-muted tabular-nums shrink-0">
          {formatTime(duration)}
        </span>
        {isCurrent && (
          <span className="text-era-accent-solid text-[11px] font-mono w-4 text-center">
            {isPlaying ? '♪' : '❚❚'}
          </span>
        )}
      </button>
    </li>
  )
}
