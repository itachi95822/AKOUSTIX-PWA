import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Music } from 'lucide-react'
import { BrandMark } from '@/components/brand/BrandMark'
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/Primitives'
import { useEraStore, ERAS } from '@/eras/EraProvider'
import { useLibraryStore } from '@/store/libraryStore'
import { usePlayerStore } from '@/store/playerStore'
import { cx } from '@/utils/format'
import type { Album } from '@/types'

// ============================================================
// CassetteHome — the Cassette era landing screen.
// Your library rendered as a physical shelf of cassette tapes.
// The tape nearest the shelf centre is promoted (raised, bright,
// face-on) while the neighbours recede with perspective depth
// and a gentle rotateY. Tap a tape to play that album.
// ============================================================

const TAPE_WIDTH = 150

export function CassetteHome() {
  const navigate = useNavigate()
  const era = useEraStore((s) => s.era)
  const { status, error, albums, songs } = useLibraryStore()
  const retry = useLibraryStore((s) => s.retry)
  const playQueue = usePlayerStore((s) => s.playQueue)

  const scrollRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const rafRef = useRef(0)
  const [focusedId, setFocusedId] = useState<string>(albums[0]?.id ?? '')

  // Imperatively style each tape from its distance to the shelf
  // centre — no re-renders while scrolling (rAF-throttled).
  const applyTransforms = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    const center = container.getBoundingClientRect().left + container.clientWidth / 2
    let nearest = albums[0]?.id ?? ''
    let nearestDist = Infinity
    itemRefs.current.forEach((el, id) => {
      const rect = el.getBoundingClientRect()
      const elCenter = rect.left + rect.width / 2
      const dist = elCenter - center
      const d = Math.abs(dist)
      if (d < nearestDist) {
        nearestDist = d
        nearest = id
      }
      const width = rect.width || TAPE_WIDTH
      const offset = Math.min(1, d / (width * 1.4))
      const rotateY = Math.max(-34, Math.min(34, (-dist / width) * 28))
      el.style.transform = `perspective(1100px) rotateY(${rotateY}deg) translateZ(${(1 - offset) * 44}px)`
      el.style.zIndex = String(Math.round((1 - offset) * 100) + 1)
      el.style.opacity = String(1 - offset * 0.55)
      el.style.filter = `brightness(${1 - offset * 0.3}) saturate(${1 - offset * 0.25})`
    })
    setFocusedId((prev) => (nearest && prev !== nearest ? nearest : prev))
  }, [albums])

  useEffect(() => {
    applyTransforms()
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(applyTransforms)
    }
    const container = scrollRef.current
    container?.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      container?.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [applyTransforms])

  const playAlbum = (albumId: string) => {
    const album = albums.find((a) => a.id === albumId)
    if (!album) return
    const albumSongs = songs.filter((s) => s.albumId === albumId)
    const start = albumSongs.findIndex((s) => s.id === album.songIds[0])
    playQueue(albumSongs, Math.max(0, start))
    navigate('/now-playing')
  }

  const focusedAlbum = albums.find((a) => a.id === focusedId) ?? albums[0]

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="pb-6">
        <div className="px-4 pt-8">
          <BrandMark />
        </div>
        <LoadingState label="Loading your AKOUSTIX library…" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="pb-6">
        <div className="px-4 pt-8">
          <BrandMark />
        </div>
        <ErrorState message={error ?? 'Please check your connection and try again.'} onRetry={retry} />
      </div>
    )
  }

  if (songs.length === 0 || albums.length === 0) {
    return (
      <div className="pb-6">
        <div className="px-4 pt-8">
          <BrandMark />
        </div>
        <EmptyState
          icon={<Music size={26} />}
          title="Your tape shelf is empty"
          message="No albums found in the AKOUSTIX Library yet. Add songs to your Supabase `songs` table to see them here."
        />
      </div>
    )
  }

  return (
    <div className="pb-6">
      {/* Brand header */}
      <div className="px-4 pt-8 flex items-center justify-between">
        <BrandMark />
        <button
          onClick={() => navigate('/settings')}
          className="era-bevel rounded-eraPill px-3 h-9 inline-flex items-center gap-1.5 bg-era-surface text-era-text-muted hover:text-era-text"
        >
          <span>{ERAS[era].glyph}</span>
          <span className="text-[11px] font-mono uppercase tracking-wide hidden xs:inline">
            {ERAS[era].name.replace(' Era', '')}
          </span>
        </button>
      </div>

      {/* Shelf heading */}
      <div className="px-4 mt-6 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-era-accent-solid">
            Cassette Collection
          </p>
          <h2 className="font-display text-[24px] leading-tight text-era-text">On the Shelf</h2>
        </div>
        <span className="text-[11px] font-mono text-era-text-muted tabular-nums">
          {albums.length} tapes
        </span>
      </div>

      {/* The tape shelf */}
      <div
        ref={scrollRef}
        className="mt-3 flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-5"
        style={{
          paddingLeft: `calc(50% - ${TAPE_WIDTH / 2}px)`,
          paddingRight: `calc(50% - ${TAPE_WIDTH / 2}px)`
        }}
      >
        {albums.map((a) => (
          <CassetteTape
            key={a.id}
            album={a}
            focused={a.id === focusedAlbum?.id}
            setEl={(el) => {
              if (el) itemRefs.current.set(a.id, el)
              else itemRefs.current.delete(a.id)
            }}
            onPress={() => playAlbum(a.id)}
          />
        ))}
      </div>

      {/* Focused tape caption */}
      {focusedAlbum && (
        <div className="px-6 mt-1 text-center">
          <p className="font-display text-xl text-era-text truncate">{focusedAlbum.title}</p>
          <p className="text-[13px] text-era-text-muted truncate mt-0.5">
            {focusedAlbum.artist}
            {focusedAlbum.year ? ` · ${focusedAlbum.year}` : ''}
          </p>
          <button
            onClick={() => playAlbum(focusedAlbum.id)}
            className="mt-4 era-bevel rounded-era bg-era-accent-solid text-era-accent-contrast h-10 px-6 inline-flex items-center gap-2 text-[14px] font-body"
          >
            <Play size={15} fill="currentColor" /> Play Tape
          </button>
        </div>
      )}

      {/* Footer flourish */}
      <div className="px-4 mt-8 flex items-center justify-center gap-2 text-era-text-muted">
        <span className="text-[11px] font-mono uppercase tracking-widest">
          Every Song Has A Memory.
        </span>
      </div>
    </div>
  )
}

// ============================================================
// A single cassette tape on the shelf. Cover art fills the
// printed label; the shell below carries the tape window,
// reel hubs and a "Side A" marker.
// ============================================================

function CassetteTape({
  album,
  focused,
  setEl,
  onPress
}: {
  album: Album
  focused: boolean
  setEl: (el: HTMLDivElement | null) => void
  onPress: () => void
}) {
  const cover = album.cover
  const isImg = cover ? /^https?:\/\//i.test(cover) || cover.startsWith('/') : false

  return (
    <div
      ref={setEl}
      className="snap-center shrink-0 will-change-transform"
      style={{ width: TAPE_WIDTH }}
    >
      <button
        onClick={onPress}
        aria-label={`Play ${album.title}`}
        className="group relative block w-full text-left focus:outline-none active:scale-[0.97] transition-transform duration-150"
      >
        <div
          className={cx(
            'relative rounded-[7px] overflow-hidden transition-shadow duration-300',
            focused && 'ring-2 ring-era-accent-solid/80'
          )}
          style={{
            background: 'linear-gradient(160deg, #3a322a 0%, #2e2823 50%, #221e1a 100%)',
            boxShadow: '0 12px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
            border: '1px solid rgba(0,0,0,0.35)'
          }}
        >
          {/* Label — cover art */}
          <div className="relative" style={{ aspectRatio: '4 / 3' }}>
            {isImg ? (
              <img
                src={cover}
                alt={album.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0" style={{ background: cover }} />
            )}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.5) 100%)'
              }}
            />
            <div className="absolute inset-0 flex flex-col justify-between p-2">
              <div className="flex items-center gap-1">
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: 'rgba(243,232,207,0.35)' }}
                />
                <span className="text-[7px] font-mono tracking-[0.2em] uppercase text-[#c8b48f]">
                  Side A
                </span>
              </div>
              <div>
                <p className="text-[11px] font-display text-white leading-tight truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                  {album.title}
                </p>
                <p className="text-[8px] font-body text-white/75 leading-tight truncate mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                  {album.artist}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom cassette strip */}
          <div
            className="px-2 py-1.5 flex items-center justify-between"
            style={{
              background: 'linear-gradient(180deg, #2e2823, #1e1a16)',
              borderTop: '1px solid rgba(0,0,0,0.3)'
            }}
          >
            <div
              className="rounded-[3px] overflow-hidden"
              style={{
                width: 42,
                height: 15,
                background: 'rgba(12,10,8,0.85)',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6)'
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, transparent 0px, rgba(60,50,35,0.3) 2px, transparent 4px)'
                }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <ReelHub />
              <span className="text-[6px] font-mono text-[#6a6252] tracking-wider">AKOUSTIX</span>
              <ReelHub />
            </div>
          </div>

          {/* Edge highlight */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)' }}
          />

          {/* Play chip on the focused tape */}
          {focused && (
            <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-era-accent-solid text-era-accent-contrast flex items-center justify-center shadow-lg">
              <Play size={12} fill="currentColor" />
            </div>
          )}
        </div>
      </button>
    </div>
  )
}

function ReelHub() {
  return (
    <div
      className="rounded-full"
      style={{
        width: 8,
        height: 8,
        background: 'radial-gradient(circle at 40% 35%, #4a3f32, #2a2218)',
        boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.35)'
      }}
    />
  )
}
