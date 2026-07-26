import type { Album, Artist, Playlist, Song } from '@/types'

// ============================================================
// AKOUSTIX in-app music library (mock data).
//
// This is the ONLY source the Search screen searches — there
// are no external suggestions. When Firestore is wired in,
// swap `library.ts` for a Firestore-backed implementation with
// the same shape; components won't change.
// ============================================================

const songs: Song[] = [
  // --- Midnight Tape (The Velour Hours) ---
  { id: 's1', title: 'Cassette Memory', artist: 'The Velour Hours', albumId: 'a1', durationSec: 214, trackNo: 1 },
  { id: 's2', title: 'Amber Light', artist: 'The Velour Hours', albumId: 'a1', durationSec: 198, trackNo: 2 },
  { id: 's3', title: 'Reel To Reel', artist: 'The Velour Hours', albumId: 'a1', durationSec: 245, trackNo: 3 },
  { id: 's4', title: 'Sunday Hiss', artist: 'The Velour Hours', albumId: 'a1', durationSec: 176, trackNo: 4 },

  // --- Glass Horizon (Solene) ---
  { id: 's5', title: 'Polished', artist: 'Solene', albumId: 'a2', durationSec: 232, trackNo: 1 },
  { id: 's6', title: 'Mirror Surface', artist: 'Solene', albumId: 'a2', durationSec: 205, trackNo: 2 },
  { id: 's7', title: 'Refraction', artist: 'Solene', albumId: 'a2', durationSec: 268, trackNo: 3 },
  { id: 's8', title: 'Clear Day', artist: 'Solene', albumId: 'a2', durationSec: 190, trackNo: 4 },

  // --- Desktop Daydreams (Pixel Pavement) ---
  { id: 's9', title: 'Boot Sequence', artist: 'Pixel Pavement', albumId: 'a3', durationSec: 162, trackNo: 1 },
  { id: 's10', title: 'Solitaire', artist: 'Pixel Pavement', albumId: 'a3', durationSec: 184, trackNo: 2 },
  { id: 's11', title: 'Minimize', artist: 'Pixel Pavement', albumId: 'a3', durationSec: 207, trackNo: 3 },
  { id: 's12', title: 'Critical Error', artist: 'Pixel Pavement', albumId: 'a3', durationSec: 153, trackNo: 4 },

  // --- Long Drive Home (Juniper Lane) ---
  { id: 's13', title: 'Long Drive Home', artist: 'Juniper Lane', albumId: 'a4', durationSec: 272, trackNo: 1 },
  { id: 's14', title: 'Headlights', artist: 'Juniper Lane', albumId: 'a4', durationSec: 221, trackNo: 2 },
  { id: 's15', title: 'Passenger', artist: 'Juniper Lane', albumId: 'a4', durationSec: 248, trackNo: 3 },

  // --- Quiet Rooms (Nora Falk) ---
  { id: 's16', title: 'Quiet Room', artist: 'Nora Falk', albumId: 'a5', durationSec: 201, trackNo: 1 },
  { id: 's17', title: 'Tea At Four', artist: 'Nora Falk', albumId: 'a5', durationSec: 188, trackNo: 2 },
  { id: 's18', title: 'Linen', artist: 'Nora Falk', albumId: 'a5', durationSec: 234, trackNo: 3 },

  // --- Neon Static (AUTO/8) ---
  { id: 's19', title: 'Neon Static', artist: 'AUTO/8', albumId: 'a6', durationSec: 256, trackNo: 1 },
  { id: 's20', title: 'Lowtide', artist: 'AUTO/8', albumId: 'a6', durationSec: 197, trackNo: 2 },
  { id: 's21', title: 'Afterglow', artist: 'AUTO/8', albumId: 'a6', durationSec: 263, trackNo: 3 },

  // --- Wood & Wire (The Foundry Bros.) ---
  { id: 's22', title: 'Wood & Wire', artist: 'The Foundry Bros.', albumId: 'a7', durationSec: 218, trackNo: 1 },
  { id: 's23', title: 'Workshop', artist: 'The Foundry Bros.', albumId: 'a7', durationSec: 192, trackNo: 2 },
  { id: 's24', title: 'Lacquer', artist: 'The Foundry Bros.', albumId: 'a7', durationSec: 240, trackNo: 3 },

  // --- Silver Spool (Marina Cross) ---
  { id: 's25', title: 'Silver Spool', artist: 'Marina Cross', albumId: 'a8', durationSec: 226, trackNo: 1 },
  { id: 's26', title: 'Magnetic', artist: 'Marina Cross', albumId: 'a8', durationSec: 209, trackNo: 2 },
  { id: 's27', title: 'Side B', artist: 'Marina Cross', albumId: 'a8', durationSec: 251, trackNo: 3 }
]

const albums: Album[] = [
  { id: 'a1', title: 'Midnight Tape', artist: 'The Velour Hours', year: 1979, cover: 'linear-gradient(135deg,#6b4a2b 0%,#221e1a 60%,#c97a3f 100%)', songIds: ['s1', 's2', 's3', 's4'] },
  { id: 'a2', title: 'Glass Horizon', artist: 'Solene', year: 1996, cover: 'linear-gradient(135deg,#e0e0e0 0%,#ffffff 45%,#b8b8b8 100%)', songIds: ['s5', 's6', 's7', 's8'] },
  { id: 'a3', title: 'Desktop Daydreams', artist: 'Pixel Pavement', year: 1998, cover: 'linear-gradient(135deg,#008080 0%,#c0c0c0 55%,#000080 100%)', songIds: ['s9', 's10', 's11', 's12'] },
  { id: 'a4', title: 'Long Drive Home', artist: 'Juniper Lane', year: 1984, cover: 'linear-gradient(135deg,#3a322a 0%,#c97a3f 70%,#f3e8cf 100%)', songIds: ['s13', 's14', 's15'] },
  { id: 'a5', title: 'Quiet Rooms', artist: 'Nora Falk', year: 2001, cover: 'linear-gradient(135deg,#d9c9a8 0%,#f3e8cf 50%,#6b4a2b 100%)', songIds: ['s16', 's17', 's18'] },
  { id: 'a6', title: 'Neon Static', artist: 'AUTO/8', year: 1992, cover: 'linear-gradient(135deg,#1a1a1a 0%,#ff6a00 65%,#b8b8b8 100%)', songIds: ['s19', 's20', 's21'] },
  { id: 'a7', title: 'Wood & Wire', artist: 'The Foundry Bros.', year: 1976, cover: 'linear-gradient(135deg,#6b4a2b 0%,#3a322a 50%,#c8b48f 100%)', songIds: ['s22', 's23', 's24'] },
  { id: 'a8', title: 'Silver Spool', artist: 'Marina Cross', year: 1988, cover: 'linear-gradient(135deg,#b8b8b8 0%,#1a1a1a 55%,#c97a3f 100%)', songIds: ['s25', 's26', 's27'] }
]

const artists: Artist[] = [
  { id: 'ar1', name: 'The Velour Hours', albumIds: ['a1'] },
  { id: 'ar2', name: 'Solene', albumIds: ['a2'] },
  { id: 'ar3', name: 'Pixel Pavement', albumIds: ['a3'] },
  { id: 'ar4', name: 'Juniper Lane', albumIds: ['a4'] },
  { id: 'ar5', name: 'Nora Falk', albumIds: ['a5'] },
  { id: 'ar6', name: 'AUTO/8', albumIds: ['a6'] },
  { id: 'ar7', name: 'The Foundry Bros.', albumIds: ['a7'] },
  { id: 'ar8', name: 'Marina Cross', albumIds: ['a8'] }
]

const playlists: Playlist[] = [
  {
    id: 'p1',
    title: 'Late Night Tape Hiss',
    description: 'Warm, worn-in tracks for the small hours.',
    cover: 'linear-gradient(135deg,#221e1a 0%,#6b4a2b 60%,#c97a3f 100%)',
    songIds: ['s1', 's13', 's22', 's4', 's16']
  },
  {
    id: 'p2',
    title: 'Polished Pop',
    description: 'Crisp, reflective and effortlessly clean.',
    cover: 'linear-gradient(135deg,#ffffff 0%,#b8b8b8 60%,#ff6a00 100%)',
    songIds: ['s5', 's6', 's8', 's25']
  },
  {
    id: 'p3',
    title: 'Start Menu',
    description: 'Pixelated daydreams from the desktop era.',
    cover: 'linear-gradient(135deg,#008080 0%,#c0c0c0 55%,#000080 100%)',
    songIds: ['s9', 's10', 's11', 's12']
  },
  {
    id: 'p4',
    title: 'Sunday Mornings',
    description: 'Gentle listens for a slow start.',
    cover: 'linear-gradient(135deg,#d9c9a8 0%,#f3e8cf 50%,#6b4a2b 100%)',
    songIds: ['s16', 's17', 's2', 's24']
  }
]

export const library = {
  songs,
  albums,
  artists,
  playlists
}

export type LibraryData = typeof library
