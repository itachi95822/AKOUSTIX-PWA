import { useMemo, useState } from 'react'
import { Search as SearchIcon, X, Music2 } from 'lucide-react'
import { ScreenHeader, EmptyState } from '@/components/ui/Primitives'
import { SongRow } from '@/components/cards/SongRow'
import { useLibraryStore } from '@/store/libraryStore'
import { usePlayerStore } from '@/store/playerStore'
import { LibraryService } from '@/services'

// ============================================================
// Search — searches ONLY the AKOUSTIX in-app library.
// No external suggestions. When a query has no matches it
// shows the exact required empty-state message.
// ============================================================

export function SearchScreen() {
  const [query, setQuery] = useState('')
  const songs = useLibraryStore((s) => s.songs)
  const playQueue = usePlayerStore((s) => s.playQueue)

  // Synchronous local search across the already-loaded library
  // (LibraryService.searchSongs is the same logic, ready to
  // swap for a Firestore query later).
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
    )
  }, [query, songs])

  const play = (songId: string) => {
    const song = songs.find((s) => s.id === songId)
    if (!song) return
    // Play the matching results as the queue, starting at the song.
    const queue = results.length ? results : [song]
    const start = Math.max(0, queue.findIndex((x) => x.id === songId))
    playQueue(queue, start)
  }

  const hasQuery = query.trim().length > 0

  return (
    <div className="pb-6">
      <ScreenHeader
        title="Search"
        subtitle="The AKOUSTIX Library only."
      />

      {/* Search bar */}
      <div className="px-4 mt-2">
        <div className="relative">
          <SearchIcon
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-era-text-muted pointer-events-none"
          />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Songs or artists…"
            aria-label="Search the AKOUSTIX library"
            className="w-full h-12 pl-11 pr-10 rounded-era era-bevel bg-era-surface text-era-text placeholder:text-era-text-muted font-body text-[15px] outline-none focus:ring-2 focus:ring-era-accent"
          />
          {hasQuery && (
            <button
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center rounded-eraPill text-era-text-muted hover:text-era-text"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <p className="mt-2 text-[12px] font-mono text-era-text-muted">
          {hasQuery
            ? `${results.length} result${results.length === 1 ? '' : 's'} in your library`
            : `${songs.length} songs available in the AKOUSTIX Library`}
        </p>
      </div>

      {/* Results / states */}
      <div className="mt-4">
        {!hasQuery && (
          <EmptyState
            icon={<SearchIcon size={26} />}
            title="Search the AKOUSTIX Library"
            message="Find songs and artists that live inside AKOUSTIX. No external results, no suggestions — just your library."
          />
        )}

        {hasQuery && results.length === 0 && (
          <EmptyState
            icon={<Music2 size={26} />}
            title="No songs found in the AKOUSTIX Library."
            message={`“${query.trim()}” isn’t in your library yet. Try another song or artist.`}
          />
        )}

        {hasQuery && results.length > 0 && (
          <ul className="space-y-0.5">
            {results.map((song) => (
              <li key={song.id}>
                <SongRow song={song} onPlay={() => play(song.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// Re-export to keep the service seam referenced (tree-shaken).
void LibraryService
