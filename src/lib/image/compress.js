// Client-side image compression: converts to WebP and tries to keep the
// final size under a target (default 150 KB). Falls back to the original
// file if running outside the browser or if conversion fails.

const DEFAULT_TARGET_BYTES = 150 * 1024;
const DEFAULT_MAX_DIM = 1600;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Compresses an image File/Blob to WebP under `targetBytes`.
 * - Skips SVG and GIF (keeps original).
 * - Iteratively reduces quality and dimensions until target met.
 * Returns a new File (with .webp extension) or the original if compression
 * isn't possible / not beneficial.
 */
export async function compressImageToWebp(file, opts = {}) {
  if (!file || typeof window === 'undefined' || typeof document === 'undefined') return file;
  if (!file.type?.startsWith('image/')) return file;
  // Skip vector & animated formats — re-encoding loses data.
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;

  const targetBytes = opts.targetBytes ?? DEFAULT_TARGET_BYTES;
  const maxDim = opts.maxDim ?? DEFAULT_MAX_DIM;

  try {
    const img = await loadImage(file);
    let { width, height } = img;
    const scale = Math.min(1, maxDim / Math.max(width, height));
    width = Math.round(width * scale);
    height = Math.round(height * scale);

    let quality = 0.9;
    let blob = null;

    // Try progressively lower quality, then shrink dimensions.
    for (let i = 0; i < 8; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;
      ctx.drawImage(img, 0, 0, width, height);
      // eslint-disable-next-line no-await-in-loop
      blob = await canvasToBlob(canvas, 'image/webp', quality);
      if (!blob) break;
      if (blob.size <= targetBytes) break;
      if (quality > 0.5) {
        quality -= 0.1;
      } else {
        width = Math.round(width * 0.85);
        height = Math.round(height * 0.85);
      }
    }

    if (!blob) return file;
    // If WebP somehow ended up larger than original, keep original.
    if (blob.size >= file.size && file.type === 'image/webp') return file;

    const baseName = (file.name || 'image').replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() });
  } catch {
    return file;
  }
}
