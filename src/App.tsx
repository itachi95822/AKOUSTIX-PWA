import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomeScreen } from '@/features/home/HomeScreen'
import { SearchScreen } from '@/features/search/SearchScreen'
import { LibraryScreen } from '@/features/library/LibraryScreen'
import { NowPlayingScreen } from '@/features/now-playing/NowPlayingScreen'
import { SettingsScreen } from '@/features/settings/SettingsScreen'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/search" element={<SearchScreen />} />
        <Route path="/library" element={<LibraryScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Route>
      <Route path="/now-playing" element={<NowPlayingScreen />} />
    </Routes>
  )
}
