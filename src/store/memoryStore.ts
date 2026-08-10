import { create } from 'zustand'
import type { SongMemory } from '@/types'
import { MemoryDb } from '@/services/memoryDb'

// ============================================================
// Memory store — one saved Memory per song. IndexedDB is the
// durable source of truth (photos can be several MB); this
// store keeps a reactive in-memory copy so the Memory icon,
// editor and slideshow all update instantly.
// ============================================================

interface MemoryState {
  memories: Record<string, SongMemory>
  /** True once the initial IndexedDB read settles. */
  hydrated: boolean
  hydrate: () => Promise<void>
  getMemory: (songId: string) => SongMemory | undefined
  hasMemory: (songId: string) => boolean
  saveMemory: (songId: string, memory: SongMemory) => Promise<void>
  deleteMemory: (songId: string) => Promise<void>
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: {},
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return
    try {
      const all = await MemoryDb.getAll()
      const map: Record<string, SongMemory> = {}
      for (const m of all) map[m.songId] = m
      set({ memories: map, hydrated: true })
    } catch {
      set({ hydrated: true })
    }
  },

  getMemory: (songId) => get().memories[songId],

  hasMemory: (songId) => Boolean(get().memories[songId]?.photos.length),

  saveMemory: async (songId, memory) => {
    const normalized: SongMemory = { ...memory, songId }
    set((s) => ({ memories: { ...s.memories, [songId]: normalized } }))
    try {
      await MemoryDb.put(normalized)
    } catch {
      // IndexedDB unavailable — keep the in-memory copy for this session.
    }
  },

  deleteMemory: async (songId) => {
    set((s) => {
      const next = { ...s.memories }
      delete next[songId]
      return { memories: next }
    })
    try {
      await MemoryDb.delete(songId)
    } catch {
      // no-op
    }
  }
}))

// Warm the store from IndexedDB as soon as the app loads.
void useMemoryStore.getState().hydrate()
