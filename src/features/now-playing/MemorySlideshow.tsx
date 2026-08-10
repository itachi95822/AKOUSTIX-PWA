import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Pencil } from 'lucide-react'

// ============================================================
// MemorySlideshow — a rain-covered window playing a song's
// saved photos. Every photo fits inside one consistent glass
// frame using `object-contain` (never cropped or stretched),
// crossfading with a slow Ken Burns zoom while realistic
// raindrops and slow water streaks drift down the pane.
// Between transitions a soft light sweeps across the glass —
// like a passing reflection or distant lightning on a rainy
// night. The photos stay sharp: no frosted blur over them.
// Audio is never touched. Only Exit and Edit are shown.
// ============================================================

const SLIDE_MS = 5000
const CROSSFADE_MS = 800

// ------------------------------------------------------------
// RainGlass — a lightweight canvas painting realistic droplets
// and slow streaks on the pane. A single rAF loop, DPR-capped
// resolution and gradient-only shapes keep it cheap.
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

    const drops: Drop[] = Array.from({ length: 88 }, () => ({
      x: rand(0, W || 1),
      y: rand(-H * 0.25, H),
      r: rand(1.1, 3.4),
      vy: rand(40, 130),
      vx: rand(-10, 10),
      wobble: rand(0.1, 0.5),
      phase: rand(0, Math.PI * 2),
      opacity: rand(0.3, 0.75)
    }))

    const streaks: Streak[] = Array.from({ length: 6 }, () => ({
      x: rand(0, W || 1),
      y: rand(-H * 0.3, H),
      len: rand(26, 64),
      w: rand(1, 2.2),
      vy: rand(60, 180),
      vx: rand(-18, 18),
      opacity: rand(0.32, 0.6)
    }))

    // A raindrop: soft glassy body + a bright specular glint up-left.
    const drawDrop = (d: Drop) => {
      const wob = Math.sin(d.phase) * d.wobble
      const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r)
      g.addColorStop(0, `rgba(226,238,252,${d.opacity})`)
      g.addColorStop(1, 'rgba(226,238,252,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.ellipse(d.x, d.y, d.r * 0.72, d.r, wob, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(d.x - d.r * 0.22, d.y - d.r * 0.3, d.r * 0.15, d.r * 0.2, wob, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${d.opacity * 0.95})`
      ctx.fill()
    }

    // A water streak: tapering tail with a brighter head droplet.
    const drawStreak = (s: Streak) => {
      const grad = ctx.createLinearGradient(0, s.y, 0, s.y + s.len)
      grad.addColorStop(0, 'rgba(218,232,250,0)')
      grad.addColorStop(1, `rgba(218,232,250,${s.opacity})`)
      ctx.strokeStyle = grad
      ctx.lineWidth = s.w
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(s.x + s.vx * 0.12, s.y + s.len)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(s.x + s.vx * 0.12, s.y + s.len, Math.max(s.w * 0.9, 0.9), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(238,246,255,${s.opacity + 0.14})`
      ctx.fill()
    }

    const frame = (now: number) => {
      if (!running) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      ctx.clearRect(0, 0, W, H)

      for (const s of streaks) {
        s.y += s.vy * dt
        s.x += s.vx * dt
        if (s.y - s.len > H || s.x < -24 || s.x > W + 24) {
          s.x = rand(0, W)
          s.y = rand(-H * 0.35, -s.len)
          s.len = rand(26, 64)
          s.opacity = rand(0.32, 0.6)
        }
        drawStreak(s)
      }

      for (const d of drops) {
        d.y += d.vy * dt
        d.x += d.vx * dt + Math.sin((d.phase += dt * 2)) * 0.14
        if (d.y > H + d.r) {
          d.y = rand(-H * 0.25, -2)
          d.x = rand(0, W)
          d.r = rand(1.1, 3.4)
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
// LightingFX — a soft light band that sweeps across the glass
// on every photo transition, with an occasional faint "distant
// lightning" glow. Remounted per transition (keyed by slide),
// so the sweep plays once, briefly, without overpowering.
// ------------------------------------------------------------

function LightingFX({ lightning }: { lightning: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Soft reflection sweeping across the wet glass */}
      <motion.div
        className="absolute top-0 bottom-0 w-[45%]"
        style={{
          left: 0,
          background:
            'linear-gradient(115deg, transparent 0%, rgba(190,215,245,0.10) 45%, rgba(235,245,255,0.18) 55%, transparent 100%)',
          transform: 'skewX(-14deg)',
          filter: 'blur(7px)'
        }}
        initial={{ x: '-130%', opacity: 0 }}
        animate={{ x: '360%', opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2, times: [0, 0.2, 0.75, 1], ease: 'easeInOut' }}
      />
      {/* Occasional distant lightning reflecting on the glass */}
      {lightning && (
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(90% 70% at 50% 30%, rgba(205,225,255,0.14) 0%, rgba(160,190,235,0.05) 45%, transparent 78%)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.5, 0] }}
          transition={{ duration: 1.4, times: [0, 0.15, 0.4, 1], ease: 'easeInOut' }}
        />
      )}
    </div>
  )
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
  const [fx, setFx] = useState({ key: 0, lightning: false })

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

  // Fire the light sweep (and occasionally a lightning glow) per transition.
  useEffect(() => {
    setFx((prev) => ({ key: prev.key + 1, lightning: Math.random() < 0.18 }))
  }, [index])

  const current = photos[index] ?? photos[0]
  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: 'radial-gradient(120% 120% at 50% 0%, rgba(16,24,40,0.55) 0%, rgba(4,7,13,0.85) 100%)',
        backdropFilter: 'blur(14px) saturate(0.8)',
        WebkitBackdropFilter: 'blur(14px) saturate(0.8)'
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
            {/* Photo — sharp, object-contain, never cropped or stretched */}
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

            {/* Nostalgic light reflections on the glass between transitions */}
            <LightingFX key={fx.key} lightning={fx.lightning} />

            {/* Barely-there glass tint — no blur, the photo stays sharp */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(115deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 24%, rgba(255,255,255,0) 42%, rgba(255,255,255,0) 74%, rgba(255,255,255,0.04) 100%)'
              }}
            />

            {/* Falling rain on the glass */}
            <RainGlass />

            {/* Soft inner vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.3)' }}
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
