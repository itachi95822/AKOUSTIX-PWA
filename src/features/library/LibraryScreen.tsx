import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Folder, Music, ListMusic, Star, User } from 'lucide-react'
import { ScreenHeader, EmptyState, Pill, LoadingState, ErrorState } from '@/components/ui/Primitives'
import { AlbumCard } from '@/components/cards/AlbumCard'
import { PlaylistCard } from '@/components/cards/PlaylistCard'
import { SongRow } from '@/components/cards/SongRow'
import { useLibraryStore } from '@/store/libraryStore'
import { usePlayerStore } from '@/store/playerStore'

// ============================================================
// Library — Albums · Artists · Playlists · Favourites ·
// Downloads (placeholder). Simple elegant grid.
// ============================================================

type Tab = 'albums' | 'artists' | 'playlists' | 'favourites' | 'downloads'

const TABS: { id: Tab; label: string; icon: typeof Music }[] = [
  { id: 'albums', label: 'Albums', icon: Music },
  { id: 'artists', label: 'Artists', icon: User },
  { id: 'playlists', label: 'Playlists', icon: ListMusic },
  { id: 'favourites', label: 'Favourites', icon: Star },
  { id: 'downloads', label: 'Downloads', icon: Download }
]

export function LibraryScreen() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('albums')
  const { status, error, albums, artists, playlists, songs } = useLibraryStore()
  const retry = useLibraryStore((s) => s.retry)
  const favourites = usePlayerStore((s) => s.favourites)
  const playQueue = usePlayerStore((s) => s.playQueue)

  const favouriteSongs = useMemo(
    () => songs.filter((s) => favourites.includes(s.id)),
    [songs, favourites]
  )

  const playAlbum = (albumId: string) => {
    const albumSongs = songs.filter((s) => s.albumId === albumId)
    playQueue(albumSongs, 0)
    navigate('/now-playing')
  }

  const playPlaylist = (playlistId: string) => {
    const pl = playlists.find((p) => p.id === playlistId)
    if (!pl) return
    const plSongs = pl.songIds
      .map((id) => songs.find((s) => s.id === id))
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
    playQueue(plSongs, 0)
    navigate('/now-playing')
  }

  const playFavourites = (startIndex = 0) => {
    if (!favouriteSongs.length) return
    playQueue(favouriteSongs, startIndex)
    navigate('/now-playing')
  }

  return (
    <div className="pb-6">
      <ScreenHeader title="Library" subtitle="Your collection, organised." />

      {/* Tab row */}
      <div className="px-4 mt-3 flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map(({ id, label, icon: Icon }) => (
          <Pill key={id} active={tab === id} onClick={() => setTab(id)}>
            <span className="inline-flex items-center gap-1.5">
              <Icon size={14} /> {label}
            </span>
          </Pill>
        ))}
      </div>

      <div className="mt-4">
        {(status === 'loading' || status === 'idle') && <LoadingState label="Loading your library…" />}
        {status === 'error' && (
          <ErrorState message={error ?? 'Please check your connection and try again.'} onRetry={retry} />
        )}
        {status === 'loaded' && songs.length === 0 && (
          <EmptyState
            icon={<Music size={26} />}
            title="Your library is empty"
            message="No songs in the AKOUSTIX Library yet. Add songs to your Supabase `songs` table to see them here."
          />
        )}
        {status === 'loaded' && songs.length > 0 && tab === 'albums' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4">
            {albums.map((a) => (
              <AlbumCard key={a.id} album={a} width="sm" onPlay={() => playAlbum(a.id)} />
            ))}
          </div>
        )}

        {status === 'loaded' && songs.length > 0 && tab === 'artists' && (
          <ul className="px-2">
            {artists.map((ar) => (
              <li
                key={ar.id}
                className="flex items-center gap-3 px-2 py-3 cursor-pointer rounded-era hover:bg-era-surface-alt/60"
                onClick={() => {
                  const firstAlbum = albums.find((a) => a.id === ar.albumIds[0])
                  if (firstAlbum) playAlbum(firstAlbum.id)
                }}
              >
                <div className="w-14 h-14 rounded-eraPill era-bevel bg-era-surface-alt flex items-center justify-center text-era-text-muted">
                  <User size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-[15px] text-era-text">{ar.name}</p>
                  <p className="truncate text-[12px] text-era-text-muted">
                    {ar.albumIds.length} album{ar.albumIds.length === 1 ? '' : 's'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {status === 'loaded' && songs.length > 0 && tab === 'playlists' && (
          <>
            {playlists.length === 0 ? (
              <EmptyState
                icon={<ListMusic size={26} />}
                title="No playlists yet"
                message="Playlists will appear here once a playlists table is added to your Supabase project."
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4">
                {playlists.map((p) => (
                  <PlaylistCard key={p.id} playlist={p} onPlay={() => playPlaylist(p.id)} />
                ))}
              </div>
            )}
          </>
        )}

        {status === 'loaded' && songs.length > 0 && tab === 'favourites' && (
          <>
            {favouriteSongs.length === 0 ? (
              <EmptyState
                icon={<Star size={26} />}
                title="No favourites yet"
                message="Tap the heart on any song to keep it here."
              />
            ) : (
              <>
                <div className="px-4 mb-3">
                  <button
                    onClick={() => playFavourites(0)}
                    className="era-bevel rounded-era bg-era-accent-solid text-era-accent-contrast h-11 px-5 inline-flex items-center gap-2 font-body text-[15px]"
                  >
                    <Music size={16} fill="currentColor" /> Play all
                  </button>
                </div>
                <ul>
                  {favouriteSongs.map((song) => (
                    <li key={song.id}>
                      <SongRow
                        song={song}
                        onPlay={() =>
                          playFavourites(favouriteSongs.findIndex((x) => x.id === song.id))
                        }
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}

        {tab === 'downloads' && (
          <EmptyState
            icon={<Folder size={26} />}
            title="Downloads coming soon"
            message="Offline downloads are a placeholder for now. Your library is always available online."
          />
        )}
      </div>
    </div>
  )
}
