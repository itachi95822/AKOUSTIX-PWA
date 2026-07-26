// ============================================================
// Authentication service (PLACEHOLDER).
//
// Exposes a minimal, framework-agnostic surface. When Firebase
// Auth is wired in, implement these against `getAuth()` /
// `signInWithEmailAndPassword`, `onAuthStateChanged`, etc.
// The UI does NOT reference Firebase directly anywhere.
// ============================================================

export interface AkxUser {
  uid: string
  email: string | null
  displayName: string | null
}

export const AuthService = {
  /** Resolves the current user, or null when signed out / backend not ready. */
  async currentUser(): Promise<AkxUser | null> {
    return null
  },

  async signInWithEmail(_email: string, _password: string): Promise<AkxUser> {
    throw new Error('Auth not configured — wire `firebase.ts` to enable sign-in.')
  },

  async signUpWithEmail(_email: string, _password: string): Promise<AkxUser> {
    throw new Error('Auth not configured — wire `firebase.ts` to enable sign-up.')
  },

  async signInAnonymously(): Promise<AkxUser> {
    throw new Error('Auth not configured — wire `firebase.ts` to enable anonymous sign-in.')
  },

  async signOut(): Promise<void> {
    /* TODO: signOut(auth) */
  },

  /** Subscribe to auth state changes. Returns an unsubscribe fn. */
  onAuthChange(_cb: (user: AkxUser | null) => void): () => void {
    return () => {}
  }
}
