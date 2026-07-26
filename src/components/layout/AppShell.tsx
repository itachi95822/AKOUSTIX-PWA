import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { BottomNav } from '@/components/navigation/BottomNav'
import { MiniPlayer } from '@/components/player/MiniPlayer'
import { InstallBanner } from '@/components/pwa/InstallPrompt'
import { useLibraryStore } from '@/store/libraryStore'

// ============================================================
// AppShell — the phone-frame layout. Hosts the scrollable
// screen outlet, the persistent MiniPlayer (except on the
// Now Playing route) and the bottom navigation.
// ============================================================

export function AppShell() {
  const location = useLocation()
  const load = useLibraryStore((s) => s.load)

  // Load the music catalog once at startup.
  useEffect(() => {
    load()
  }, [load])

  // Scroll to top on tab change.
  useEffect(() => {
    const main = document.getElementById('akx-scroll')
    if (main) main.scrollTo({ top: 0 })
  }, [location.pathname])

  const hideMiniPlayer = location.pathname === '/now-playing'

  return (
    <div className="akx-shell flex flex-col era-grain-overlay">
      <main id="akx-scroll" className="flex-1 overflow-y-auto era-scroll">
        <Outlet />
      </main>
      <InstallBanner />
      {!hideMiniPlayer && <MiniPlayer />}
      <BottomNav />
    </div>
  )
}
