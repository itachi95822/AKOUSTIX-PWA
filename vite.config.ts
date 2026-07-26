import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-icon-180.png'],
      manifest: {
        name: 'AKOUSTIX',
        short_name: 'AKOUSTIX',
        description: "Every Song Has A Memory. — a nostalgia-inspired music streaming PWA.",
        lang: 'en',
        dir: 'ltr',
        categories: ['music', 'entertainment', 'lifestyle'],
        theme_color: '#1a1714',
        background_color: '#1a1714',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'apple-icon-180.png', sizes: '180x180', type: 'image/png', purpose: 'any' }
        ],
        shortcuts: [
          { name: 'Now Playing', short_name: 'Playing', url: '/now-playing', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
          { name: 'Library', short_name: 'Library', url: '/library', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
          { name: 'Search', short_name: 'Search', url: '/search', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        navigateFallback: 'index.html'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
