import { NavLink } from 'react-router-dom'
import { Home, Search, Library, PlayCircle, Settings } from 'lucide-react'
import { cx } from '@/utils/format'

// ============================================================
// BottomNav — the only five sections in AKOUSTIX.
// No hidden menus, no extra tabs.
// ============================================================

const ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/search', label: 'Search', icon: Search, end: false },
  { to: '/library', label: 'Library', icon: Library, end: false },
  { to: '/now-playing', label: 'Playing', icon: PlayCircle, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false }
]

export function BottomNav() {
  return (
    <nav
      className="sticky bottom-0 z-30 bg-era-surface/95 backdrop-blur-md border-t border-era-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5 h-16">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cx(
                  'flex flex-col items-center justify-center gap-1 h-full transition-colors',
                  isActive ? 'text-era-accent-solid' : 'text-era-text-muted hover:text-era-text'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    fill={isActive && to === '/now-playing' ? 'currentColor' : 'none'}
                  />
                  <span className="text-[10px] font-body tracking-wide">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
