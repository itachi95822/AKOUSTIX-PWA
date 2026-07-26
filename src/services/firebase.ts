// ============================================================
// Firebase bootstrap (PLACEHOLDER).
//
// AKOUSTIX ships without a live backend so the UI is fully
// explorable. When you are ready to integrate Firebase:
//   1. `npm install firebase`
//   2. Add Vite env vars: VITE_FIREBASE_API_KEY, etc.
//   3. Uncomment + fill in the config below.
//   4. Wire `Auth` -> `AuthService`, `db` -> `FirestoreService`,
//      `storage` -> `AudioStreamingService` / `StorageService`.
//
// No UI component references Firebase directly — everything
// flows through the service modules in this folder.
// ============================================================

// import { initializeApp, getApps, getApp } from 'firebase/app'
// import { getAuth } from 'firebase/auth'
// import { getFirestore } from 'firebase/firestore'
// import { getStorage } from 'firebase/storage'

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

export function readFirebaseConfig(): FirebaseConfig | null {
  const env = import.meta.env
  const apiKey = env.VITE_FIREBASE_API_KEY
  const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN
  const projectId = env.VITE_FIREBASE_PROJECT_ID
  const storageBucket = env.VITE_FIREBASE_STORAGE_BUCKET
  const messagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID
  const appId = env.VITE_FIREBASE_APP_ID
  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    return null
  }
  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId
  }
}

// const config = readFirebaseConfig()
// export const app = config ? (getApps().length ? getApp() : initializeApp(config)) : null
// export const auth = app ? getAuth(app) : null
// export const db = app ? getFirestore(app) : null
// export const storage = app ? getStorage(app) : null

export const firebaseReady = false
