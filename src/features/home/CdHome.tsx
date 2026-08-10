import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Music } from 'lucide-react'
import { BrandMark } from '@/components/brand/BrandMark'
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/Primitives'
import { useEraStore, ERAS } from '@/eras/EraProvider'
import { useLibraryStore } from '@/store/libraryStore'
import { usePlayerStore } from '@/store/playerStore'
import type { Album } from '@/types'

// ============================================================
// CdHome — the CD era landing screen.
// Your library as a tactile deck of record sleeves fanned on a
// turntable. The top sleeve is the focused album (face-on and
// prominent); the next sleeves fan out behind it with rotation
// and depth, and a vinyl disc peeks out from the side. Tap the
// top sleeve to play, arrows or the fan to browse.
// ============================================================

const SLEEVE = { width: 160, height: 160 }
const FAN_COUNT = 3

export function CdHome() {
  const navigate = useNavigate()
  const era = useEraStore((s) => s.era)
  const { status, error, albums, songs } = useLibraryStore()
  const retry = useLibraryStore((s) => s.retry)
  const playQueue = usePlayerStore((s) => s.playQueue)

  const [index, setIndex] = useState(0)
  const count = albums.length

  const playAlbum = (albumId: string) => {
    const album = albums.find((a) => a.id === albumId)
    if (!album) return
    const albumSongs = songs.filter((s) => s.albumId === albumId)
    const start = albumSongs.findIndex((s) => s.id === album.songIds[0])
    playQueue(albumSongs, Math.max(0, start))
    navigate('/now-playing')
  }

  const cycle = (dir: 1 | -1) => {
    if (!count) return
    setIndex((i) => (i + dir + count) % count)
  }

  const focusedAlbum = albums[index] ?? albums[0]

  const backSleeves =
    count > 1
      ? Array.from({ length: Math.min(FAN_COUNT, count - 1) }, (_, k) => ({
          offset: k + 1,
          album: albums[(index + k + 1) % count]
        }))
      : []

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
          title="Your disc deck is empty"
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

      {/* Deck heading */}
      <div className="px-4 mt-6 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-era-accent-solid">
            Disc Collection
          </p>
          <h2 className="font-display text-[24px] leading-tight text-era-text">On the Turntable</h2>
        </div>
        <span className="text-[11px] font-mono text-era-text-muted tabular-nums">
          {albums.length} discs
        </span>
      </div>

      {/* The deck */}
      <div
        className="relative mx-auto mt-4 w-full"
        style={{ maxWidth: 340, height: 252, perspective: 1100 }}
      >
        {/* Vinyl disc peeking out behind the focused sleeve */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={focusedAlbum.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute"
            style={{ left: 10, top: 28, width: 150, height: 150 }}
          >
            <VinylDisc cover={focusedAlbum.cover} title={focusedAlbum.title} />
          </motion.div>
        </AnimatePresence>

        {/* Back sleeves fanning out behind */}
        {backSleeves.map(({ offset, album }) => (
          <button
            key={album.id}
            aria-label={`Browse ${album.title}`}
            onClick={() => setIndex(albums.indexOf(album))}
            className="absolute block text-left focus:outline-none"
            style={{
              left: `calc(50% - ${SLEEVE.width / 2}px)`,
              top: 8,
              width: SLEEVE.width,
              height: SLEEVE.height,
              zIndex: 24 - offset,
              transform: `translateX(${24 + (offset - 1) * 30}px) translateY(${8 + (offset - 1) * 9}px) rotate(${4 + (offset - 1) * 5}deg) translateZ(${-offset * 34}px)`,
              opacity: 1 - offset * 0.22,
              filter: `brightness(${1 - offset * 0.22})`
            }}
          >
            <Sleeve album={album} dimmed />
          </button>
        ))}

        {/* Focused sleeve on top */}
        <AnimatePresence mode="popLayout">
          <motion.button
            key={focusedAlbum.id}
            onClick={() => playAlbum(focusedAlbum.id)}
            aria-label={`Play ${focusedAlbum.title}`}
            initial={{ opacity: 0, rotate: -6, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, rotate: -2, y: 0, scale: 1.05 }}
            exit={{ opacity: 0, rotate: 9, y: -12, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="absolute block text-left focus:outline-none"
            style={{
              left: `calc(50% - ${SLEEVE.width / 2}px)`,
              top: 8,
              width: SLEEVE.width,
              height: SLEEVE.height,
              zIndex: 30
            }}
          >
            <Sleeve album={focusedAlbum} />
          </motion.button>
        </AnimatePresence>

        {/* Browse arrows */}
        {count > 1 && (
          <>
            <button
              aria-label="Previous disc"
              onClick={() => cycle(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full era-bevel bg-era-surface text-era-text items-center justify-center flex z-40"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              aria-label="Next disc"
              onClick={() => cycle(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full era-bevel bg-era-surface text-era-text items-center justify-center flex z-40"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Focused disc caption */}
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
            <Play size={15} fill="currentColor" /> Play Disc
          </button>
          <p className="mt-3 text-[11px] font-mono text-era-text-muted/70 uppercase tracking-widest">
            Tap the deck · arrows to browse
          </p>
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
// A physical CD sleeve (jewel case) with cover art, a blue
// spine and a text strip along the bottom edge.
// ============================================================

function Sleeve({ album, dimmed = false }: { album: Album; dimmed?: boolean }) {
  const cover = album.cover
  const isImg = /^https?:\/\//i.test(cover) || cover.startsWith('/')

  return (
    <div
      className="relative w-full h-full rounded-[8px] overflow-hidden"
      style={{
        background: isImg ? undefined : 'linear-gradient(165deg, #182233 0%, #0f1620 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 14px 32px rgba(0,0,0,0.5)',
        border: '1px solid rgba(222,229,240,0.08)'
      }}
    >
      {/* Spine */}
      <div
        className="absolute left-0 inset-y-0 w-[6px]"
        style={{ background: 'linear-gradient(180deg, #5ba3ff, #1a2535)' }}
      />
      {/* Cover art */}
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
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />
      {dimmed && <div className="absolute inset-0 bg-black/10 pointer-events-none" />}
      {/* Text strip */}
      <div
        className="absolute inset-x-0 bottom-0 px-2 py-1.5 text-left"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(5,10,18,0.78))' }}
      >
        <p className="text-[10px] font-display text-white truncate leading-tight">{album.title}</p>
        <p className="text-[8px] text-white/70 truncate leading-tight">{album.artist}</p>
      </div>
    </div>
  )
}

// ============================================================
// A vinyl/commercial disc whose printed label is the album art.
// ============================================================

function VinylDisc({ cover, title }: { cover: string; title: string }) {
  const isImg = /^https?:\/\//i.test(cover) || cover.startsWith('/')

  return (
    <div
      className="w-full h-full rounded-full relative"
      style={{
        background:
          'radial-gradient(circle at 50% 50%, #0c1522 0%, #182233 26%, #3a4a5a 40%, #8a9aaa 47%, #c0c8d0 52%, #3a4a5a 60%, #141e2c 80%, #0a111c 100%)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.5), inset 0 0 18px rgba(0,0,0,0.45)'
      }}
    >
      {/* Grooves */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'repeating-radial-gradient(circle at 50% 50%, transparent 0 3px, rgba(0,0,0,0.16) 3px 4px)'
        }}
      />
      {/* Printed label = cover art */}
      <div
        className="absolute rounded-full overflow-hidden"
        style={{
          left: '18%',
          top: '18%',
          width: '64%',
          height: '64%',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.4)'
        }}
      >
        {isImg ? (
          <img
            src={cover}
            alt={title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: cover }} />
        )}
      </div>
      {/* Spindle */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: '11%',
          height: '11%',
          background: 'radial-gradient(circle at 50% 50%, #141e2c 0%, #060a10 100%)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
        }}
      />
    </div>
  )
}
