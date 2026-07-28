import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, History, Heart, Disc3, Compass, Music } from 'lucide-react'
import { BrandMark } from '@/components/brand/BrandMark'
import { AlbumCard } from '@/components/cards/AlbumCard'
import { PlaylistCard } from '@/components/cards/PlaylistCard'
import { Rail } from '@/components/cards/Rail'
import { SectionHeader, LoadingState, ErrorState, EmptyState } from '@/components/ui/Primitives'
import { AlbumArt } from '@/components/ui/AlbumArt'
import { useEraStore, ERAS } from '@/eras/EraProvider'
import { useLibraryStore, useAlbumById, useSongById } from '@/store/libraryStore'
import { usePlayerStore } from '@/store/playerStore'

// ============================================================
// Home — the landing tab.
// Recently Played · Continue Listening · Favourite Albums ·
// Featured Playlists · Recommended Collections.
// ============================================================

export function HomeScreen() {
  const navigate = useNavigate()
  const era = useEraStore((s) => s.era)
  const { status, error, albums, playlists, songs } = useLibraryStore()
  const retry = useLibraryStore((s) => s.retry)
  const recentlyPlayed = usePlayerStore((s) => s.recentlyPlayed)
  const favourites = usePlayerStore((s) => s.favourites)
  const playQueue = usePlayerStore((s) => s.playQueue)
  const playSong = usePlayerStore((s) => s.playSong)

  // Seed a little history on first load so Home isn't empty.
  useEffect(() => {
    if (status !== 'loaded') return
    if (usePlayerStore.getState().recentlyPlayed.length === 0 && songs.length) {
      usePlayerStore.setState({
        recentlyPlayed: songs.slice(0, 5).map((s) => s.id)
      })
    }
  }, [status, songs])

  const recentAlbums = useMemo(() => {
    const seen = new Set<string>()
    const out = []
    for (const id of recentlyPlayed) {
      const song = songs.find((s) => s.id === id)
      if (!song) continue
      const album = albums.find((a) => a.id === song.albumId)
      if (album && !seen.has(album.id)) {
        seen.add(album.id)
        out.push(album)
      }
      if (out.length >= 6) break
    }
    return out
  }, [recentlyPlayed, songs, albums])

  const lastPlayedId = recentlyPlayed[0]
  const continueSong = useSongById(lastPlayedId)
  const continueAlbum = useAlbumById(continueSong?.albumId)

  const favouriteAlbums = useMemo(() => {
    if (!favourites.length) return albums.slice(2, 6)
    const favAlbumIds = new Set<string>()
    for (const sid of favourites) {
      const song = songs.find((s) => s.id === sid)
      if (song) favAlbumIds.add(song.albumId)
    }
    const list = albums.filter((a) => favAlbumIds.has(a.id))
    return list.length ? list.slice(0, 6) : albums.slice(2, 6)
  }, [favourites, songs, albums])

  const featured = playlists[0]
  const otherPlaylists = playlists.slice(1)
  const recommended = albums

  const playAlbum = (albumId: string) => {
    const album = albums.find((a) => a.id === albumId)
    if (!album) return
    const albumSongs = songs.filter((s) => s.albumId === albumId)
    const start = albumSongs.findIndex((s) => s.id === album.songIds[0])
    playQueue(albumSongs, Math.max(0, start))
    navigate('/now-playing')
  }

  const playPlaylist = (playlistId: string, startIndex = 0) => {
    const pl = playlists.find((p) => p.id === playlistId)
    if (!pl) return
    const plSongs = pl.songIds
      .map((id) => songs.find((s) => s.id === id))
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
    playQueue(plSongs, startIndex)
    navigate('/now-playing')
  }

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

  if (songs.length === 0) {
    return (
      <div className="pb-6">
        <div className="px-4 pt-8">
          <BrandMark />
        </div>
        <EmptyState
          icon={<Music size={26} />}
          title="Your library is empty"
          message="No songs found in the AKOUSTIX Library yet. Add songs to your Supabase `songs` table to see them here."
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

      {/* Continue Listening — big hero card */}
      {continueSong && continueAlbum && (
        <section className="px-4 mt-6">
          <SectionHeaderLike icon={<History size={16} />} label="Continue Listening" />
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              playSong(continueSong, songs)
              navigate('/now-playing')
            }}
            className="relative w-full h-52 rounded-eraLg overflow-hidden era-bevel flex items-end p-4 ring-1 ring-black/5"
            style={{ background: continueAlbum.cover }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-black/10" />
            <div className="absolute right-4 top-4">
              <AlbumArt
                cover={continueAlbum.cover}
                alt={continueAlbum.title}
                size="md"
                float
                rounded
              />
            </div>
            <div className="relative text-white max-w-[60%]">
              <p className="text-[11px] font-mono uppercase tracking-widest opacity-80">
                {continueAlbum.title}
              </p>
              <p className="font-display text-2xl leading-tight drop-shadow">
                {continueSong.title}
              </p>
              <p className="text-[13px] opacity-90">{continueSong.artist}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 bg-era-accent-solid text-era-accent-contrast px-3 h-8 rounded-eraPill text-[13px] font-body">
                <Play size={14} fill="currentColor" /> Resume
              </span>
            </div>
          </motion.button>
        </section>
      )}

      {/* Recently Played */}
      <section className="mt-2">
        <SectionHeader title="Recently Played" />
        {recentAlbums.length ? (
          <Rail ariaLabel="Recently played albums">
            {recentAlbums.map((a) => (
              <div key={a.id} className="snap-start">
                <AlbumCard album={a} onPlay={() => playAlbum(a.id)} />
              </div>
            ))}
          </Rail>
        ) : (
          <p className="px-4 text-[13px] text-era-text-muted">
            Play something to see it here.
          </p>
        )}
      </section>

      {/* Favourite Albums */}
      <section>
        <SectionHeader
          title="Favourite Albums"
          action="See all"
          onAction={() => navigate('/library')}
        />
        <Rail ariaLabel="Favourite albums">
          {favouriteAlbums.map((a) => (
            <div key={a.id} className="snap-start">
              <AlbumCard album={a} onPlay={() => playAlbum(a.id)} />
            </div>
          ))}
        </Rail>
      </section>

      {/* Featured Playlists — hidden until a playlists table exists in Supabase */}
      {playlists.length > 0 && (
        <section>
          <SectionHeader title="Featured Playlists" />
          {featured && (
            <div className="px-4">
              <PlaylistCard playlist={featured} wide onPlay={() => playPlaylist(featured.id)} />
            </div>
          )}
          {otherPlaylists.length > 0 && (
            <div className="mt-3">
              <Rail ariaLabel="More playlists">
                {otherPlaylists.map((p) => (
                  <PlaylistCard key={p.id} playlist={p} onPlay={() => playPlaylist(p.id)} />
                ))}
              </Rail>
            </div>
          )}
        </section>
      )}

      {/* Recommended Collections */}
      <section>
        <SectionHeader
          title="Recommended Collections"
          action="Browse"
          onAction={() => navigate('/library')}
        />
        <Rail ariaLabel="Recommended albums">
          {recommended.map((a) => (
            <div key={a.id} className="snap-start">
              <AlbumCard album={a} width="md" onPlay={() => playAlbum(a.id)} />
            </div>
          ))}
        </Rail>
      </section>

      {/* Footer flourish */}
      <div className="px-4 mt-8 flex items-center justify-center gap-2 text-era-text-muted">
        <Disc3 size={14} />
        <Compass size={14} />
        <Heart size={14} />
        <span className="text-[11px] font-mono uppercase tracking-widest">
          Every Song Has A Memory.
        </span>
      </div>
    </div>
  )
}

function SectionHeaderLike({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-era-accent-solid">{icon}</span>
      <h2 className="font-display text-[22px] leading-tight tracking-tight text-era-text">
        {label}
      </h2>
    </div>
  )
}
