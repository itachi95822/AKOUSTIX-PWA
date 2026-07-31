import { useEffect, useState } from 'react'
import { cx } from '@/utils/format'

// ============================================================
// SplashScreen — premium branded launch overlay.
// Deep navy pool with expanding water ripples, floating glowing
// music notes, and the AKOUSTIX logo breathing over a soft
// ambient glow. Holds for ~2.5s, then fades out so the app is
// already mounted underneath when it reveals.
//
// Deliberately avoids AnimatePresence: exit animations are
// unreliable under React 18 StrictMode (the node can stay
// mounted forever), so the fade is a plain CSS transition and
// the overlay unmounts via a timer.
// ============================================================

interface NoteSpec {
  left: string
  top: string
  fontSize: number
  duration: number
  delay: number
  color: string
  glyph: string
}

const NOTES: NoteSpec[] = [
  { left: '12%', top: '18%', fontSize: 22, duration: 5.4, delay: 0.0, color: '#7cb8ff', glyph: '♪' },
  { left: '80%', top: '14%', fontSize: 18, duration: 6.2, delay: 0.8, color: '#ffb27d', glyph: '♫' },
  { left: '16%', top: '58%', fontSize: 16, duration: 5.8, delay: 1.6, color: '#9fe8d8', glyph: '♩' },
  { left: '76%', top: '64%', fontSize: 20, duration: 5.0, delay: 0.4, color: '#7cb8ff', glyph: '♬' },
  { left: '86%', top: '38%', fontSize: 14, duration: 6.6, delay: 2.2, color: '#ff9d5c', glyph: '♪' },
  { left: '7%', top: '40%', fontSize: 14, duration: 6.0, delay: 1.2, color: '#ffb27d', glyph: '♫' },
  { left: '45%', top: '8%', fontSize: 15, duration: 5.6, delay: 0.6, color: '#9fe8d8', glyph: '♩' },
  { left: '52%', top: '80%', fontSize: 17, duration: 6.4, delay: 1.8, color: '#7cb8ff', glyph: '♬' }
]

/** How long the splash holds before the fade-out starts. */
const HOLD_MS = 2500
/** Fade-out duration, must match `.akx-splash` transition. */
const FADE_MS = 600

export function SplashScreen() {
  const [phase, setPhase] = useState<'show' | 'fade'>('show')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const hold = setTimeout(() => setPhase('fade'), HOLD_MS)
    const remove = setTimeout(() => setDone(true), HOLD_MS + FADE_MS)
    return () => {
      clearTimeout(hold)
      clearTimeout(remove)
    }
  }, [])

  if (done) return null

  return (
    <div
      aria-hidden="true"
      className={cx(
        'akx-splash fixed inset-0 z-[999] flex items-center justify-center overflow-hidden',
        phase === 'fade' && 'akx-splash-fading'
      )}
    >
      {/* pool glow rising from the bottom */}
      <div className="akx-splash-pool" />

      {/* expanding water ripples */}
      <div className="akx-splash-ripple" />
      <div className="akx-splash-ripple" />
      <div className="akx-splash-ripple" />

      {/* ambient glow behind the logo */}
      <div className="akx-splash-glow" />

      {/* floating glowing music notes */}
      {NOTES.map((n, i) => (
        <span
          key={i}
          className="akx-splash-note"
          style={{
            left: n.left,
            top: n.top,
            fontSize: n.fontSize,
            color: n.color,
            animationDuration: `${n.duration}s`,
            animationDelay: `${n.delay}s`
          }}
        >
          {n.glyph}
        </span>
      ))}

      {/* breathing logo */}
      <div className="akx-splash-logo-wrap relative z-10 flex flex-col items-center">
        <div className="akx-splash-logo">
          <img
            src="/akoustix-logo.png"
            alt="AKOUSTIX"
            draggable={false}
            className="w-full h-full object-cover"
          />
        </div>
        <p className="akx-splash-tagline">Every Song Has A Memory.</p>
      </div>
    </div>
  )
}
