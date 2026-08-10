import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Pencil } from 'lucide-react'

// ============================================================
// MemorySlideshow — a rain-covered window playing a song's
// saved photos. Every photo fits inside one consistent glass
// frame using `object-contain` (never cropped or stretched),
// crossfading with a slow Ken Burns zoom while small raindrops
// and occasional streaks drift down the pane. Audio is never
// touched. Only Exit and Edit are shown, per spec.
// ============================================================

const SLIDE_MS = 5000
const CROSSFADE_MS = 800

// ------------------------------------------------------------
// RainGlass — a lightweight canvas that paints soft raindrops
// and the occasional falling streak on top of the pane. A
// single rAF loop, DPR-capped resolution and a handful of
// shapes keep it cheap enough to run for as long as the
// slideshow is open.
// ------------------------------------------------------------

interface Drop {
  x: number
  y: number
  r: number
  vy: number
  vx: number
  wobble: number
  phase: number
  opacity: number
}

interface Streak {
  x: number
  y: number
  len: number
  w: number
  vy: number
  vx: number
  opacity: number
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)

function RainGlass() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0
    let H = 0
    let raf = 0
    let running = true
    let last = performance.now()

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      W = Math.max(1, rect.width)
      H = Math.max(1, rect.height)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const drops: Drop[] = Array.from({ length: 52 }, () => ({
      x: rand(0, W || 1),
      y: rand(-H * 0.25, H),
      r: rand(0.9, 2.5),
      vy: rand(36, 96),
      vx: rand(-8, 8),
      wobble: rand(0.1, 0.45),
      phase: rand(0, Math.PI * 2),
      opacity: rand(0.16, 0.38)
    }))

    const streaks: Streak[] = Array.from({ length: 4 }, () => ({
      x: rand(0, W || 1),
      y: rand(-H * 0.3, H),
      len: rand(14, 40),
      w: rand(0.8, 1.6),
      vy: rand(240, 420),
      vx: rand(-14, 14),
      opacity: rand(0.12, 0.26)
    }))

    const drawDrop = (d: Drop) => {
      const wob = Math.sin(d.phase) * d.wobble
      const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r)
      g.addColorStop(0, `rgba(212,227,246,${d.opacity})`)
      g.addColorStop(1, 'rgba(212,227,246,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.ellipse(d.x, d.y, d.r * 0.7, d.r, wob, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawStreak = (s: Streak) => {
      const grad = ctx.createLinearGradient(0, s.y, 0, s.y + s.len)
      grad.addColorStop(0, 'rgba(210,225,245,0)')
      grad.addColorStop(1, `rgba(210,225,245,${s.opacity})`)
      ctx.strokeStyle = grad
      ctx.lineWidth = s.w
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(s.x + s.vx * 0.08, s.y + s.len)
      ctx.stroke()
    }

    const frame = (now: number) => {
      if (!running) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      ctx.clearRect(0, 0, W, H)

      for (const s of streaks) {
        s.y += s.vy * dt
        s.x += s.vx * dt
        if (s.y - s.len > H || s.x < -20 || s.x > W + 20) {
          s.x = rand(0, W)
          s.y = rand(-H * 0.3, -s.len)
          s.len = rand(14, 42)
          s.opacity = rand(0.12, 0.26)
        }
        drawStreak(s)
      }

      for (const d of drops) {
        d.y += d.vy * dt
        d.x += d.vx * dt + Math.sin(d.phase += dt * 2) * 0.12
        if (d.y > H + d.r) {
          d.y = rand(-H * 0.25, -2)
          d.x = rand(0, W)
          d.r = rand(0.9, 2.5)
        }
        drawDrop(d)
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden />
}

// ------------------------------------------------------------
// Slideshow
// ------------------------------------------------------------

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
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: 'radial-gradient(120% 120% at 50% 0%, rgba(16,24,40,0.55) 0%, rgba(4,7,13,0.85) 100%)',
        backdropFilter: 'blur(18px) saturate(0.8)',
        WebkitBackdropFilter: 'blur(18px) saturate(0.8)'
      }}
    >
      {/* Window — one consistent frame for every photo */}
      <div className="flex-1 flex items-center justify-center" style={{ padding: 'max(env(safe-area-inset-top), 3rem) 1.25rem 6rem' }}>
        <div className="relative w-[min(88vw,420px)] aspect-[4/5] max-h-[64dvh] rounded-[1.75rem] p-1.5"
          style={{
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 1px 0 rgba(255,255,255,0.06) inset, 0 0 60px rgba(0,0,0,0.55), 0 24px 70px rgba(0,0,0,0.5)'
          }}
        >
          <div className="relative w-full h-full overflow-hidden rounded-[1.35rem] bg-black/30"
            style={{
              boxShadow: '0 0 0 1px rgba(255,255,255,0.1) inset, 0 2px 6px rgba(0,0,0,0.4) inset'
            }}
          >
            {/* Photo — object-contain, never cropped or stretched */}
            <AnimatePresence initial={false}>
              <motion.img
                key={`${index}-${photos.length}`}
                src={current}
                alt="Memory"
                draggable={false}
                className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1.22 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: CROSSFADE_MS / 1000, ease: 'easeInOut' },
                  scale: { duration: SLIDE_MS / 1000, ease: 'easeInOut' }
                }}
              />
            </AnimatePresence>

            {/* Glass pane — faint tint + reflection so the photo sits behind glass */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backdropFilter: 'blur(1.5px) saturate(1.05)',
                WebkitBackdropFilter: 'blur(1.5px) saturate(1.05)',
                background:
                  'linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 22%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 72%, rgba(255,255,255,0.05) 100%)'
              }}
            />

            {/* Falling rain on the glass */}
            <RainGlass />

            {/* Soft inner vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.35)' }}
            />
          </div>
        </div>
      </div>

      {/* Photo counter (subtle, below the window) */}
      <span
        className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2 font-mono text-[12px] tracking-[0.25em] text-white/45"
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
