import { motion, AnimatePresence } from 'framer-motion'
import { X, Mic2 } from 'lucide-react'
import { useCurrentSong } from '@/store/playerStore'
import { useAlbumById } from '@/store/libraryStore'

// ============================================================
// LyricsPanel — slide-up panel. Lyrics are a PLACEHOLDER for
// now (synced lyrics arrive with the audio streaming service).
// ============================================================

export function LyricsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const song = useCurrentSong()
  const album = useAlbumById(song?.albumId)

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
                <Mic2 size={18} className="text-era-accent-solid" />
                <h3 className="font-display text-xl text-era-text">Lyrics</h3>
              </div>
              <button
                aria-label="Close lyrics"
                onClick={onClose}
                className="w-9 h-9 inline-flex items-center justify-center rounded-eraPill text-era-text-muted hover:text-era-text"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto era-scroll p-6 text-center">
              <p className="font-display text-2xl text-era-text">{song?.title}</p>
              <p className="text-[13px] text-era-text-muted mt-1">
                {song?.artist} — {album?.title}
              </p>
              <div className="mt-8 mx-auto max-w-xs">
                <div className="text-[44px] mb-4">📝</div>
                <p className="font-body text-[15px] text-era-text-muted leading-relaxed">
                  Lyrics are a placeholder for now.
                </p>
                <p className="font-body text-[13px] text-era-text-muted/80 leading-relaxed mt-2">
                  Synced lyrics will appear here once the audio streaming service is connected.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
