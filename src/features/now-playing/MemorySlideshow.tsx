import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Pencil } from 'lucide-react'

// ============================================================
// MemorySlideshow — full-screen faded-glass overlay that plays
// a song's saved photos one at a time with a slow Ken Burns
// zoom, crossfading between them and looping continuously
// while the song plays (audio is untouched). Only Exit and
// Edit are shown, per spec.
// ============================================================

const SLIDE_MS = 5000
const CROSSFADE_MS = 800

export function MemorySlideshow({
  photos,
  onExit,
  onEdit
}: {
  photos: string[]
  onExit: () => void
  onEdit: () => void
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (photos.length < 2) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length)
    }, SLIDE_MS)
    return () => clearInterval(timer)
  }, [photos.length])

  useEffect(() => {
    setIndex(0)
  }, [photos])

  const current = photos[index] ?? photos[0]
  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(120% 120% at 50% 0%, rgba(16,24,40,0.55) 0%, rgba(4,7,13,0.85) 100%)',
        backdropFilter: 'blur(18px) saturate(0.8)',
        WebkitBackdropFilter: 'blur(18px) saturate(0.8)'
      }}
    >
      {/* Photo stage */}
      <AnimatePresence initial={false}>
        <motion.img
          key={`${index}-${photos.length}`}
          src={current}
          alt="Memory"
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
          style={{ padding: 'max(env(safe-area-inset-top), 2rem) 1rem 5rem' }}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1.22 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: CROSSFADE_MS / 1000, ease: 'easeInOut' },
            scale: { duration: SLIDE_MS / 1000, ease: 'easeInOut' }
          }}
        />
      </AnimatePresence>

      {/* Photo counter (subtle, above the controls) */}
      <span
        className="absolute bottom-[5.25rem] left-1/2 -translate-x-1/2 font-mono text-[12px] tracking-[0.25em] text-white/45"
        style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
      >
        {photos.length > 1 ? `${(index % photos.length) + 1} / ${photos.length}` : '1 / 1'}
      </span>

      {/* Controls — Exit and Edit only */}
      <div
        className="absolute right-3 flex items-center gap-2"
        style={{ top: 'max(env(safe-area-inset-top), 0.75rem)' }}
      >
        <button
          aria-label="Edit memory"
          onClick={onEdit}
          className="h-10 px-3 rounded-eraPill inline-flex items-center gap-1.5 text-[13px] font-body text-white/90 bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Pencil size={15} /> Edit
        </button>
        <button
          aria-label="Exit slideshow"
          onClick={onExit}
          className="h-10 px-3 rounded-eraPill inline-flex items-center gap-1.5 text-[13px] font-body text-white/90 bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={16} /> Exit
        </button>
      </div>
    </div>
  )
}
