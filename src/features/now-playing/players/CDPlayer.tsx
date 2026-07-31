import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Heart, Mic2, ListMusic, Play, Pause
} from 'lucide-react'
import { formatTime, cx } from '@/utils/format'
import { useLibraryStore } from '@/store/libraryStore'
import { usePlayerStore } from '@/store/playerStore'
import type { EraPlayerProps } from '../parts'
import type { Album, Song } from '@/types'

function TimelineSlider({
  currentTime,
  duration,
  onSeek
}: {
  currentTime: number
  duration: number
  onSeek: (s: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const [dragging, setDragging] = useState(false)
  const [dragPct, setDragPct] = useState<number | null>(null)

  const pct = dragging && dragPct !== null ? dragPct : duration ? (currentTime / duration) * 100 : 0
  const shownTime = dragging && dragPct !== null ? (dragPct / 100) * duration : currentTime

  const seekFromClientX = (clientX: number) => {
    const el = trackRef.current
    if (!el || !duration) return
    const rect = el.getBoundingClientRect()
    const next = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    setDragPct(next * 100)
    onSeek(next * duration)
  }

  const endDrag = () => {
    draggingRef.current = false
    setDragging(false)
    setDragPct(null)
  }

  return (
    <div className="w-full mt-4 px-1">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono tabular-nums tracking-wider min-w-[2.5rem] text-right" style={{ color: 'rgba(222,229,240,0.3)' }}>
          {formatTime(shownTime)}
        </span>
        <div
          ref={trackRef}
          className="relative flex-1 h-1.5 rounded-full cursor-pointer group select-none"
          style={{ background: 'rgba(222,229,240,0.06)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)', touchAction: 'none' }}
          onPointerDown={(e) => {
            draggingRef.current = true
            try {
              e.currentTarget.setPointerCapture(e.pointerId)
            } catch {
              // Pointer already released — capture is optional.
            }
            setDragging(true)
            seekFromClientX(e.clientX)
          }}
          onPointerMove={(e) => {
            if (draggingRef.current) seekFromClientX(e.clientX)
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #3a7bd5, #5ba3ff)',
              boxShadow: '0 0 6px rgba(91,163,255,0.25)'
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${pct}%`, background: '#5ba3ff', boxShadow: '0 0 6px rgba(91,163,255,0.4)' }}
          />
        </div>
        <span className="text-[10px] font-mono tabular-nums tracking-wider min-w-[2.5rem]" style={{ color: 'rgba(222,229,240,0.3)' }}>
          {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}

function MoonSweep() {
  return (
    <div
      className="absolute inset-0 rounded-[inherit] pointer-events-none"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(91,163,255,0.03) 30%, rgba(255,255,255,0.04) 50%, rgba(91,163,255,0.03) 70%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'moonSweep 10s ease-in-out infinite'
      }}
    />
  )
}

function RainbowRing() {
  return (
    <div
      className="absolute inset-0 rounded-full pointer-events-none"
      style={{
        background: 'conic-gradient(from 0deg, rgba(91,163,255,0.15), rgba(180,140,255,0.12), rgba(140,200,255,0.15), rgba(100,180,220,0.12), rgba(91,163,255,0.15))',
        mask: 'radial-gradient(circle at 50% 50%, transparent 84%, black 86%, black 95%, transparent 97%)',
        WebkitMask: 'radial-gradient(circle at 50% 50%, transparent 84%, black 86%, black 95%, transparent 97%)'
      }}
    />
  )
}

function CDDisc({
  cover,
  spinStyle,
  isEjecting
}: {
  cover: string
  spinStyle: React.CSSProperties
  isEjecting: boolean
}) {
  const isImg = /^https?:\/\//i.test(cover) || cover.startsWith('/')
  return (
    <div
      className={cx('w-full h-full rounded-full relative', isEjecting ? '' : 'animate-disc-spin')}
      style={{
        ...spinStyle,
        animationPlayState: isEjecting ? 'paused' : spinStyle.animationPlayState
      }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(10,14,24,0.95) 0%, rgba(40,52,72,0.9) 15%, rgba(180,190,200,0.3) 35%, rgba(200,210,220,0.2) 55%, rgba(180,190,200,0.15) 85%, rgba(140,150,160,0.1) 100%)',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
        }}
      />
      <RainbowRing />
      {/* Printed label — the currently playing song's actual cover art */}
      <div
        className="absolute rounded-full overflow-hidden"
        style={{
          left: '17%',
          top: '17%',
          width: '66%',
          height: '66%',
          background: isImg ? undefined : cover,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.3)'
        }}
      >
        {isImg && (
          <img
            src={cover}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: '12%',
          height: '12%',
          background: 'radial-gradient(circle at 50% 50%, rgba(10,14,24,0.95) 30%, rgba(30,40,55,0.8) 60%, transparent 100%)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)'
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: '30%',
            height: '30%',
            background: 'radial-gradient(circle at 50% 50%, rgba(60,80,110,0.6) 0%, transparent 100%)'
          }}
        />
      </div>
    </div>
  )
}

// ============================================================
// Playback arm — realistic tonearm with 4 phases:
//   retracted (50°) → lowering → active (35°–5° sweeping) →
//   raising. CSS transition delivers the smooth mechanical
//   feel; ref-based DOM updates avoid re-renders on every
//   progress tick.
// ============================================================
function PlaybackArm({
  armTarget,
  isPlaying
}: {
  armTarget: number
  isPlaying: boolean
}) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        right: '-4%',
        bottom: '-4%',
        width: '60%',
        height: '60%',
        transformOrigin: '100% 100%',
        transform: `rotate(${armTarget}deg)`,
        transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          left: '15%',
          bottom: '0%',
          width: '85%',
          height: '2px',
          transformOrigin: '100% 50%',
          background: 'linear-gradient(90deg, rgba(180,190,200,0.3), rgba(220,225,230,0.6))',
          boxShadow: '0 0 2px rgba(0,0,0,0.3)'
        }}
      >
        <div
          className="absolute rounded-sm"
          style={{
            left: '-2px',
            top: '-2px',
            width: '6px',
            height: '6px',
            background: 'radial-gradient(circle at 40% 40%, rgba(200,210,220,0.8), rgba(100,120,140,0.5))',
            boxShadow: `0 0 ${isPlaying ? '4px' : '0'} rgba(91,163,255,0.4)`,
            transition: 'box-shadow 0.5s ease'
          }}
        />
      </div>
      <div
        className="absolute rounded-full"
        style={{
          right: '-3px',
          bottom: '-3px',
          width: '10px',
          height: '10px',
          background: 'radial-gradient(circle at 40% 35%, #8a9aaa, #3a4a5a)',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.15), 0 1px 3px rgba(0,0,0,0.4)'
        }}
      />
    </div>
  )
}

function CDDrive({
  cover,
  isPlaying,
  loadState,
  discKey,
  spinStyle
}: {
  cover: string
  isPlaying: boolean
  loadState: 'empty' | 'loading' | 'loaded' | 'ejecting'
  discKey: string
  spinStyle: React.CSSProperties
}) {
  return (
    <div className="relative w-full overflow-hidden" style={{ borderRadius: '16px' }}>
      <div className="mat-gunmetal relative px-5 pt-5 pb-2">
        <MoonSweep />
        <div
          className="relative mx-auto overflow-hidden"
          style={{
            width: 260,
            height: 260,
            borderRadius: '14px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.5)'
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #0c1522, #060a10)',
              borderRadius: '14px'
            }}
          />
          <AnimatePresence mode="wait">
            {loadState !== 'empty' && (
              <motion.div
                key={discKey}
                className="absolute inset-0 flex items-center justify-center"
                style={{ padding: '30px' }}
                initial={{ x: 320, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, opacity: 1, scale: 1, transition: { type: 'spring', damping: 22, stiffness: 180, mass: 0.8 } }}
                exit={{ x: -320, opacity: 0, scale: 0.9, transition: { type: 'spring', damping: 20, stiffness: 200, mass: 0.7 } }}
              >
                <CDDisc cover={cover} spinStyle={spinStyle} isEjecting={loadState === 'ejecting'} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex items-center gap-2">
            <div
              className="rounded-full"
              style={{
                width: 6,
                height: 6,
                background: isPlaying ? '#5ba3ff' : '#1a2535',
                boxShadow: isPlaying ? '0 0 6px rgba(91,163,255,0.5)' : 'none',
                transition: 'all 0.5s ease'
              }}
            />
            <span className="text-[10px] font-mono tracking-[0.15em] uppercase" style={{ color: 'rgba(222,229,240,0.25)' }}>
              {isPlaying ? 'Play' : 'Stop'}
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-[0.2em] uppercase" style={{ color: 'rgba(222,229,240,0.15)' }}>
            Compact Disc Player
          </span>
        </div>
      </div>
    </div>
  )
}

function InfoPanel({
  song,
  albumTitle
}: {
  song: Song
  albumTitle: string
}) {
  return (
    <div className="w-full mt-4">
      <div
        className="w-full rounded-xl px-4 py-3"
        style={{
          background: 'linear-gradient(160deg, rgba(10,16,28,0.9) 0%, rgba(6,10,18,0.95) 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), 0 2px 8px rgba(0,0,0,0.3)'
        }}
      >
        <p className="font-display text-lg font-light tracking-wide truncate" style={{ color: '#dee5f0' }}>
          {song.title}
        </p>
        <p className="text-[12px] font-light tracking-wide truncate mt-0.5" style={{ color: 'rgba(222,229,240,0.5)' }}>
          {song.artist}{albumTitle ? ` — ${albumTitle}` : ''}
        </p>
      </div>
    </div>
  )
}

function HwButton({
  label,
  onClick,
  active = false,
  children,
  className = ''
}: {
  label: string
  onClick?: () => void
  active?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx('relative inline-flex items-center justify-center rounded-xl transition-all duration-150 select-none active:scale-90', className)}
      style={{
        background: active
          ? 'linear-gradient(145deg, rgba(91,163,255,0.2), rgba(91,163,255,0.08))'
          : 'linear-gradient(145deg, rgba(20,30,48,0.8), rgba(10,16,28,0.9))',
        boxShadow: active
          ? 'inset 0 1px 0 rgba(91,163,255,0.2), 0 2px 6px rgba(0,0,0,0.3)'
          : 'inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 6px rgba(0,0,0,0.3)',
        color: active ? '#5ba3ff' : 'rgba(222,229,240,0.7)'
      }}
    >
      {children}
    </button>
  )
}

function TransportControls({ onPrev, onTogglePlay, onNext, isPlaying }: {
  onPrev: () => void
  onTogglePlay: () => void
  onNext: () => void
  isPlaying: boolean
}) {
  return (
    <div className="flex items-center justify-center gap-4 mt-5">
      <HwButton label="Previous" onClick={onPrev} className="w-12 h-12">
        <SkipBack size={18} />
      </HwButton>
      <button
        aria-label={isPlaying ? 'Pause' : 'Play'}
        onClick={onTogglePlay}
        className="relative inline-flex items-center justify-center rounded-xl transition-all duration-150 active:scale-90"
        style={{
          width: 60,
          height: 60,
          background: 'linear-gradient(145deg, rgba(91,163,255,0.25), rgba(91,163,255,0.1))',
          boxShadow: 'inset 0 1px 0 rgba(91,163,255,0.2), 0 3px 12px rgba(91,163,255,0.15)',
          color: '#5ba3ff'
        }}
      >
        {isPlaying ? <Pause size={26} /> : <Play size={26} className="ml-0.5" />}
      </button>
      <HwButton label="Next" onClick={onNext} className="w-12 h-12">
        <SkipForward size={18} />
      </HwButton>
    </div>
  )
}

function SecondarySection({
  isFavourite, onToggleFavourite, onOpenLyrics, onOpenQueue, repeat, onCycleRepeat, shuffle, onToggleShuffle
}: {
  isFavourite: boolean
  onToggleFavourite: () => void
  onOpenLyrics: () => void
  onOpenQueue: () => void
  repeat: string
  onCycleRepeat: () => void
  shuffle: boolean
  onToggleShuffle: () => void
}) {
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat

  return (
    <div className="flex items-center justify-center gap-3 mt-4">
      <HwButton label="Shuffle" active={shuffle} onClick={onToggleShuffle} className="w-10 h-10">
        <Shuffle size={16} />
      </HwButton>
      <HwButton label="Repeat" active={repeat !== 'off'} onClick={onCycleRepeat} className="w-10 h-10">
        <RepeatIcon size={16} />
      </HwButton>
      <HwButton label={isFavourite ? 'Remove favourite' : 'Add favourite'} active={isFavourite} onClick={onToggleFavourite} className="w-10 h-10">
        <Heart size={16} fill={isFavourite ? 'currentColor' : 'none'} />
      </HwButton>
      <HwButton label="Lyrics" onClick={onOpenLyrics} className="w-10 h-10">
        <Mic2 size={16} />
      </HwButton>
      <HwButton label="Queue" onClick={onOpenQueue} className="w-10 h-10">
        <ListMusic size={16} />
      </HwButton>
    </div>
  )
}

function CollectionCard({ album, song, onPlay }: {
  album: Album | undefined
  song: Song
  onPlay: (s: Song) => void
}) {
  const cover = album?.cover ?? 'linear-gradient(135deg, #1a2535, #0c1522)'
  const isImg = /^https?:\/\//i.test(cover) || cover.startsWith('/')

  return (
    <motion.button
      onClick={() => onPlay(song)}
      className="text-left group focus:outline-none"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
    >
      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{
          aspectRatio: '1',
          background: isImg ? undefined : cover,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)'
        }}
      >
        {isImg && (
          <img
            src={cover}
            alt={album?.title ?? song.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="rounded-full flex items-center justify-center" style={{ width: 34, height: 34, background: 'rgba(5,10,18,0.7)', backdropFilter: 'blur(4px)' }}>
            <Play size={15} className="text-[#dee5f0] ml-0.5" />
          </div>
        </div>
      </div>
      <div className="mt-1.5 px-0.5">
        <p className="text-[11px] font-medium truncate" style={{ color: '#dee5f0' }}>{album?.title || song.title}</p>
        <p className="text-[10px] truncate mt-0.5" style={{ color: 'rgba(222,229,240,0.45)' }}>{song.artist}</p>
      </div>
    </motion.button>
  )
}

function AlbumBrowse({ onPlaySong }: { onPlaySong: (s: Song) => void }) {
  const songs = useLibraryStore((s) => s.songs)
  const albums = useLibraryStore((s) => s.albums)

  if (!songs.length) return null

  const displayCount = Math.min(songs.length, 12)

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[13px] font-medium tracking-wider uppercase" style={{ color: 'rgba(222,229,240,0.4)' }}>Your Collection</h3>
        <span className="text-[10px] font-mono" style={{ color: 'rgba(222,229,240,0.2)' }}>{songs.length} tracks</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: displayCount }).map((_, i) => {
          const s = songs[i]
          if (!s) return null
          const album = albums.find((a) => a.id === s.albumId)
          return <CollectionCard key={s.id} album={album} song={s} onPlay={onPlaySong} />
        })}
      </div>
    </div>
  )
}

// ============================================================
// Main CD Player
// ============================================================
export function CDPlayer(props: EraPlayerProps) {
  const {
    song, album, isPlaying, currentTime, duration,
    repeat, shuffle, isFavourite,
    onSeek, onTogglePlay, onNext, onPrev,
    onToggleShuffle, onCycleRepeat, onToggleFavourite,
    onOpenLyrics, onOpenQueue
  } = props

  const pct = duration ? (currentTime / duration) * 100 : 0

  // ─── Resolve cover from library if prop album is undefined ───
  const libraryAlbum = useLibraryStore((s) => s.albums.find((a) => a.id === song.albumId))
  const effectiveAlbum = album ?? libraryAlbum
  const cover = effectiveAlbum?.cover ?? 'linear-gradient(135deg, #1a2535, #0c1522)'
  const albumTitle = effectiveAlbum?.title ?? ''

  // ─── Animation state machine ───
  const [loadState, setLoadState] = useState<'empty' | 'loading' | 'loaded' | 'ejecting'>('loaded')
  const [spinDuration, setSpinDuration] = useState(isPlaying ? 4 : 0)
  const [armTarget, setArmTarget] = useState(isPlaying ? 35 - pct * 0.3 : 50)
  const prevSongId = useRef(song.id)
  const animTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const pctRef = useRef(pct)
  pctRef.current = pct

  const clearTimers = useCallback(() => {
    animTimers.current.forEach(clearTimeout)
    animTimers.current = []
  }, [])

  const spinStyle: React.CSSProperties = spinDuration > 0
    ? { animationDuration: `${spinDuration}s`, animationPlayState: 'running' as const }
    : { animationDuration: '0.001s', animationPlayState: 'paused' as const }

  // ─── Song change: retract arm → eject → load → lower arm ───
  useEffect(() => {
    if (prevSongId.current !== song.id) {
      clearTimers()
      prevSongId.current = song.id

      setArmTarget(50)
      setLoadState('ejecting')
      setSpinDuration(0)

      const t1 = setTimeout(() => {
        setLoadState('loading')
        const t2 = setTimeout(() => {
          setLoadState('loaded')
          if (isPlaying) {
            setSpinDuration(0.8)
            const t3 = setTimeout(() => setSpinDuration(2), 250)
            const t4 = setTimeout(() => {
              setSpinDuration(4)
              setArmTarget(35)
            }, 700)
            animTimers.current.push(t3, t4)
          } else {
            setArmTarget(35)
          }
        }, 500)
        animTimers.current.push(t2)
      }, 400)
      animTimers.current.push(t1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song.id])

  // ─── Play/pause: accelerate / decelerate + arm ───
  useEffect(() => {
    if (loadState !== 'loaded') return
    clearTimers()

    if (isPlaying) {
      setSpinDuration(0.6)
      const t1 = setTimeout(() => setSpinDuration(1.5), 150)
      const t2 = setTimeout(() => {
        setSpinDuration(4)
        setArmTarget(35 - pctRef.current * 0.3)
      }, 500)
      animTimers.current.push(t1, t2)
    } else {
      setArmTarget(50)
      const steps = [
        { dur: 8, delay: 150 },
        { dur: 20, delay: 500 },
        { dur: 60, delay: 1000 },
        { dur: 0, delay: 1600 }
      ]
      steps.forEach(({ dur, delay }) => {
        const t = setTimeout(() => setSpinDuration(dur), delay)
        animTimers.current.push(t)
      })
    }
    return () => clearTimers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, loadState])

  // ─── Arm sweep during playback ───
  useEffect(() => {
    if (isPlaying && loadState === 'loaded') {
      setArmTarget(35 - pct * 0.3)
    }
  }, [pct, isPlaying, loadState])

  // Cleanup timers on unmount
  useEffect(() => () => clearTimers(), [clearTimers])

  // ─── Album card playback ───
  const playSong = useCallback((s: Song) => {
    usePlayerStore.getState().playSong(s, useLibraryStore.getState().songs)
  }, [])

  return (
    <div className="px-4 pt-3 pb-6 flex flex-col items-center">
      <div className="relative w-full overflow-hidden" style={{ borderRadius: '18px' }}>
        <div className="absolute inset-0 rounded-[18px] pointer-events-none" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.5)' }} />
        <div className="mat-gunmetal px-4 pt-4 pb-5">
          <MoonSweep />

          <CDDrive cover={cover} isPlaying={isPlaying} loadState={loadState} discKey={song.id} spinStyle={spinStyle} />

          {/* Playback arm — positioned to overlap the drive window */}
          <div className="relative mx-auto" style={{ width: 260, marginTop: -220 }}>
            <PlaybackArm armTarget={armTarget} isPlaying={isPlaying} />
          </div>

          <InfoPanel song={song} albumTitle={albumTitle} />

          {/* Timeline slider */}
          <TimelineSlider currentTime={currentTime} duration={duration} onSeek={onSeek} />

          <TransportControls onPrev={onPrev} onTogglePlay={onTogglePlay} onNext={onNext} isPlaying={isPlaying} />

          <SecondarySection
            isFavourite={isFavourite} onToggleFavourite={onToggleFavourite}
            onOpenLyrics={onOpenLyrics} onOpenQueue={onOpenQueue}
            repeat={repeat} onCycleRepeat={onCycleRepeat}
            shuffle={shuffle} onToggleShuffle={onToggleShuffle}
          />

          <AlbumBrowse onPlaySong={playSong} />
        </div>
      </div>
    </div>
  )
}
