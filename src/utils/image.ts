// ============================================================
// Image helpers — turning gallery files into compact data URLs
// so a saved Memory persists durably in IndexedDB without
// eating the device quota.
// ============================================================

const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.85

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not decode image'))
    img.src = src
  })
}

function downscaleToDataUrl(img: HTMLImageElement, fallback: string): string {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return fallback
  // Flatten onto a light backdrop so translucent PNGs don't go black.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, w, h)
  const out = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  return out.length > fallback.length ? fallback : out
}

/** Read a gallery file as a downscaled JPEG data URL (original kept if it can't be re-encoded). */
export async function fileToMemoryDataUrl(file: File): Promise<string> {
  const raw = await readAsDataUrl(file)
  try {
    const img = await loadImage(raw)
    return downscaleToDataUrl(img, raw)
  } catch {
    // HEIC or other formats the browser can't re-encode — keep the original.
    return raw
  }
}
