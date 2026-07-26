// ============================================================
// Generates AKOUSTIX PWA icons (pwa-192.png, pwa-512.png) and
// favicon.svg into /public using a hand-rolled PNG encoder —
// no native dependencies required.
//
//   node scripts/gen-icons.mjs
// ============================================================
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '..', 'public')

// ---------- tiny PNG encoder ----------
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
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  // scanlines with filter byte 0
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

// ---------- drawing ----------
function hexToRGB(h) {
  const n = parseInt(h.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function drawIcon(size) {
  const bg = hexToRGB('#221e1a')
  const disc = hexToRGB('#c97a3f')
  const cream = hexToRGB('#f3e8cf')
  const ring = hexToRGB('#6b4a2b')
  const rgba = Buffer.alloc(size * size * 4)
  const cx = size / 2
  const cy = size / 2
  const rOuter = size * 0.42
  const rInner = size * 0.12
  const rRing = size * 0.3
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const dx = x - cx
      const dy = y - cy
      const d = Math.sqrt(dx * dx + dy * dy)
      let [r, g, b] = bg
      // rounded corners (maskable-safe): keep bg to the edges
      if (d < rOuter) {
        ;[r, g, b] = disc
        // groove ring
        const ringDelta = Math.abs(d - rRing)
        if (ringDelta < size * 0.012) [r, g, b] = ring
        // center hole
        if (d < rInner) [r, g, b] = cream
        // subtle highlight wedge
        const ang = Math.atan2(dy, dx)
        if (ang > -1.2 && ang < -0.2 && d > rInner && d < rOuter) {
          r = Math.min(255, r + 30)
          g = Math.min(255, g + 30)
          b = Math.min(255, b + 30)
        }
      }
      rgba[i] = r
      rgba[i + 1] = g
      rgba[i + 2] = b
      rgba[i + 3] = 255
    }
  }
  return encodePNG(size, size, rgba)
}

// ---------- favicon.svg ----------
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#221e1a"/>
  <circle cx="32" cy="32" r="22" fill="#c97a3f"/>
  <circle cx="32" cy="32" r="15" fill="none" stroke="#6b4a2b" stroke-width="1.5"/>
  <circle cx="32" cy="32" r="5" fill="#f3e8cf"/>
</svg>
`

// ---------- write ----------
mkdirSync(PUBLIC, { recursive: true })
writeFileSync(join(PUBLIC, 'pwa-192.png'), drawIcon(192))
writeFileSync(join(PUBLIC, 'pwa-512.png'), drawIcon(512))
writeFileSync(join(PUBLIC, 'favicon.svg'), FAVICON_SVG)
writeFileSync(
  join(PUBLIC, 'robots.txt'),
  'User-agent: *\nAllow: /\n'
)
console.log('Generated pwa-192.png, pwa-512.png, favicon.svg, robots.txt in /public')
