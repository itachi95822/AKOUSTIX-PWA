import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'

// ============================================================
// PlayerToast — non-intrusive banner for transient playback
// errors (e.g. a track failed to load). Auto-dismisses after a
// few seconds; never blocks interaction. Sits above the nav.
// ============================================================

export function PlayerToast() {
  const error = usePlayerStore((s) => s.error)
  const errorAt = usePlayerStore((s) => s.errorAt)
  const clearError = usePlayerStore((s) => s.clearError)
  const [visible, setVisible] = useState(false)

  // Show on a new error, auto-hide after 4s.
  useEffect(() => {
    if (!error || !errorAt) {
      setVisible(false)
      return
    }
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      // Clear after the exit animation so re-trigger works.
      setTimeout(clearError, 300)
    }, 4000)
    return () => clearTimeout(t)
  }, [error, errorAt, clearError])

  return (
    <AnimatePresence>
      {visible && error && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="fixed left-2 right-2 z-50 mx-auto max-w-[472px] bottom-20"
          role="status"
          aria-live="polite"
        >
          <div className="era-bevel rounded-era bg-era-surface px-3 py-2.5 flex items-center gap-2.5 shadow-era pointer-events-auto">
            <AlertTriangle size={18} className="text-era-accent-solid shrink-0" />
            <p className="flex-1 min-w-0 text-[13px] font-body text-era-text leading-snug">
              {error}
            </p>
            <button
              aria-label="Dismiss"
              onClick={() => {
                setVisible(false)
                setTimeout(clearError, 200)
              }}
              className="w-7 h-7 inline-flex items-center justify-center rounded-eraPill text-era-text-muted hover:text-era-text shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
