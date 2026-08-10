import type { SongMemory } from '@/types'

// ============================================================
// IndexedDB persistence for song Memories. Photos are stored
// as data URLs, so a saved Memory survives reloads without the
// user re-selecting anything from their gallery.
// ============================================================

const DB_NAME = 'akoustix-memories'
const DB_VERSION = 1
const STORE = 'memories'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'songId' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
  })
  return dbPromise
}

function runTx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode)
        const req = run(t.objectStore(STORE))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'))
      })
  )
}

export const MemoryDb = {
  getAll(): Promise<SongMemory[]> {
    return runTx<SongMemory[]>('readonly', (s) => s.getAll() as IDBRequest<SongMemory[]>)
  },
  get(songId: string): Promise<SongMemory | undefined> {
    return runTx<SongMemory | undefined>('readonly', (s) => s.get(songId) as IDBRequest<SongMemory | undefined>)
  },
  put(memory: SongMemory): Promise<IDBValidKey> {
    return runTx('readwrite', (s) => s.put(memory))
  },
  delete(songId: string): Promise<undefined> {
    return runTx<undefined>('readwrite', (s) => s.delete(songId) as IDBRequest<undefined>)
  }
}
