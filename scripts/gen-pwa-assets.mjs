// ============================================================
// Generates additional PWA assets:
//   - pwa-maskable-512.png  (maskable icon with safe-zone padding)
//   - apple-icon-180.png    (180x180 iOS home-screen icon)
//   - splash-*.png          (iOS launch/splash screens, key device sizes)
//
// Branded splash: dark (#221e1a) background with a centered
// cassette-disc glyph + a cream wordmark bar. Reuses the
// hand-rolled PNG encoder (no native deps).
//
//   node scripts/gen-pwa-assets.mjs
// ============================================================
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '..', 'public')

// ---------- PNG encoder (same as gen-icons.mjs) ----------
function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ])
}

// ---------- helpers ----------
const BG = [0x22, 0x1e, 0x1a] // #221e1a
const DISC = [0xc9, 0x7a, 0x3f] // #c97a3f
const CREAM = [0xf3, 0xe8, 0xcf] // #f3e8cf
const RING = [0x6b, 0x4a, 0x2b] // #6b4a2b

function setPx(rgba, w, x, y, [r, g, b], a = 255) {
  if (x < 0 || y < 0 || x >= w || y >= rgba.length / 4 / w) return
  const i = (y * w + x) * 4
  // alpha blend over existing
  const ea = a / 255
  rgba[i] = Math.round(rgba[i] * (1 - ea) + r * ea)
  rgba[i + 1] = Math.round(rgba[i + 1] * (1 - ea) + g * ea)
  rgba[i + 2] = Math.round(rgba[i + 2] * (1 - ea) + b * ea)
  rgba[i + 3] = 255
}

function fillRect(rgba, w, h, x0, y0, w2, h2, color) {
  for (let y = y0; y < y0 + h2 && y < h; y++)
    for (let x = x0; x < x0 + w2 && x < w; x++) setPx(rgba, w, x, y, color)
}

function fillDisc(rgba, w, h, cx, cy, r, color) {
  const r2 = r * r
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const dx = x - cx
      const dy = y - cy
      const d = dx * dx + dy * dy
      if (d <= r2) setPx(rgba, w, x, y, color)
      // anti-alias edge
      if (d > r2 && d <= (r + 1) * (r + 1)) {
        const t = 1 - (Math.sqrt(d) - r)
        setPx(rgba, w, x, y, color, Math.max(0, Math.min(255, t * 255)))
      }
    }
  }
}

function ringDisc(rgba, w, h, cx, cy, r, thickness, color) {
  const r2 = r * r
  const ri2 = (r - thickness) * (r - thickness)
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const dx = x - cx
      const dy = y - cy
      const d = dx * dx + dy * dy
      if (d <= r2 && d >= ri2) setPx(rgba, w, x, y, color)
    }
  }
}

// ---------- maskable icon (safe-zone padded) ----------
// Maskable icons get cropped to a circle/squircle by Android; the
// safe zone is the central 80%. We fill the whole canvas with bg
// and put the disc in the center 70% so it survives cropping.
function makeMaskable(size) {
  const rgba = Buffer.alloc(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    rgba[i * 4] = BG[0]; rgba[i * 4 + 1] = BG[1]; rgba[i * 4 + 2] = BG[2]; rgba[i * 4 + 3] = 255
  }
  const c = size / 2
  const discR = size * 0.32 // within safe zone
  fillDisc(rgba, size, size, c, c, discR, DISC)
  ringDisc(rgba, size, size, c, c, discR, size * 0.015, RING)
  fillDisc(rgba, size, size, c, c, size * 0.07, CREAM) // center hole
  return encodePNG(size, size, rgba)
}

// ---------- 180x180 apple icon ----------
function makeAppleIcon(size) {
  const rgba = Buffer.alloc(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    rgba[i * 4] = BG[0]; rgba[i * 4 + 1] = BG[1]; rgba[i * 4 + 2] = BG[2]; rgba[i * 4 + 3] = 255
  }
  const c = size / 2
  const r = size * 0.4
  fillDisc(rgba, size, size, c, c, r, DISC)
  ringDisc(rgba, size, size, c, c, r, size * 0.02, RING)
  fillDisc(rgba, size, size, c, c, size * 0.09, CREAM)
  return encodePNG(size, size, rgba)
}

// ---------- iOS splash screen ----------
// Dark bg + centered disc glyph + cream wordmark bar.
function makeSplash(w, h) {
  const rgba = Buffer.alloc(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = BG[0]; rgba[i * 4 + 1] = BG[1]; rgba[i * 4 + 2] = BG[2]; rgba[i * 4 + 3] = 255
  }
  const cx = w / 2
  const discR = Math.min(w, h) * 0.16
  const cy = h * 0.42
  fillDisc(rgba, w, h, cx, cy, discR, DISC)
  ringDisc(rgba, w, h, cx, cy, discR, Math.min(w, h) * 0.008, RING)
  fillDisc(rgba, w, h, cx, cy, discR * 0.22, CREAM)
  // wordmark bar (a cream rounded rectangle approximated by a filled rect)
  const barW = w * 0.5
  const barH = Math.max(8, h * 0.012)
  const barX = (w - barW) / 2
  const barY = cy + discR + h * 0.05
  fillRect(rgba, w, h, Math.round(barX), Math.round(barY), Math.round(barW), Math.round(barH), CREAM)
  return encodePNG(w, h, rgba)
}

// ---------- write everything ----------
mkdirSync(PUBLIC, { recursive: true })

// maskable + apple icon
writeFileSync(join(PUBLIC, 'pwa-maskable-512.png'), makeMaskable(512))
writeFileSync(join(PUBLIC, 'apple-icon-180.png'), makeAppleIcon(180))

// iOS splash screens (key modern device sizes)
const SPLASHES = [
  { w: 750, h: 1334, name: 'splash-750x1334.png' },     // iPhone 6/7/8
  { w: 1170, h: 2532, name: 'splash-1170x2532.png' },   // iPhone 12/13/14/15
  { w: 1242, h: 2688, name: 'splash-1242x2688.png' },   // iPhone 12/13/14 Plus
  { w: 1290, h: 2796, name: 'splash-1290x2796.png' },   // iPhone 14/15 Pro
  { w: 2048, h: 2732, name: 'splash-2048x2732.png' }    // iPad Pro 12.9
]
for (const s of SPLASHES) {
  writeFileSync(join(PUBLIC, s.name), makeSplash(s.w, s.h))
}

console.log('Generated: pwa-maskable-512.png, apple-icon-180.png, ' + SPLASHES.map((s) => s.name).join(', '))
