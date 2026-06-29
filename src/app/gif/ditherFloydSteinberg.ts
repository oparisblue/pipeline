import { nearestColorIndex, Palette } from "gifenc";

/**
 * Apply a palette to an RGBA image using Floyd-Steinberg error-diffusion dithering.
 * This hides the banding that 256 colour palettes otherwise produce on gradients, at the
 * cost of being slower than a plain nearest-colour mapping.
 * @return One palette index per pixel.
 */
export function ditherFloydSteinberg(
  rgba: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
  palette: Palette
): Uint8Array {
  // Copy the pixel data into floats, as the diffused errors are fractional and can push
  // channels temporarily outside of the 0-255 range
  let data = Float32Array.from(rgba);

  let index = new Uint8Array(width * height);

  // Cache palette lookups - searching all 256 palette entries for every pixel is slow.
  // Error diffusion makes pixel values continuous, so exact repeats are rare; instead,
  // cache on the pixel reduced to 5 bits per channel
  let cache = new Map<number, number>();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let i = (y * width + x) * 4;

      let r = clamp255(data[i]);
      let g = clamp255(data[i + 1]);
      let b = clamp255(data[i + 2]);

      let key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      let nearest: number;
      if (cache.has(key)) {
        nearest = cache.get(key);
      } else {
        nearest = nearestColorIndex(palette, [r, g, b]);
        cache.set(key, nearest);
      }

      index[y * width + x] = nearest;

      // Find the quantisation error for this pixel...
      let colour = palette[nearest];
      let errorR = r - colour[0];
      let errorG = g - colour[1];
      let errorB = b - colour[2];

      // ...and diffuse it onto the neighbouring, not-yet-visited pixels
      diffuse(data, width, height, x + 1, y, errorR, errorG, errorB, 7 / 16);
      diffuse(
        data,
        width,
        height,
        x - 1,
        y + 1,
        errorR,
        errorG,
        errorB,
        3 / 16
      );
      diffuse(data, width, height, x, y + 1, errorR, errorG, errorB, 5 / 16);
      diffuse(
        data,
        width,
        height,
        x + 1,
        y + 1,
        errorR,
        errorG,
        errorB,
        1 / 16
      );
    }
  }

  return index;
}

function clamp255(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function diffuse(
  data: Float32Array,
  width: number,
  height: number,
  x: number,
  y: number,
  errorR: number,
  errorG: number,
  errorB: number,
  weight: number
): void {
  if (x < 0 || x >= width || y >= height) return;

  let i = (y * width + x) * 4;
  data[i] += errorR * weight;
  data[i + 1] += errorG * weight;
  data[i + 2] += errorB * weight;
}
