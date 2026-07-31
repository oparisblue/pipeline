/**
 * Type declarations for the bundled gifenc library, which does not ship its own.
 * Only the parts of the API that Pipeline uses are declared here.
 * @see {@link https://github.com/mattdesl/gifenc}
 */
declare module "gifenc" {
  /** A colour palette: an array of [r, g, b] (or [r, g, b, a]) tuples. */
  export type Palette = number[][];

  export interface GIFEncoderInstance {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      opts?: {
        palette?: Palette;
        /** Frame delay in milliseconds. */
        delay?: number;
        /** -1 = play once, 0 = loop forever, > 0 = loop count. */
        repeat?: number;
        transparent?: boolean;
        transparentIndex?: number;
        colorDepth?: number;
        dispose?: number;
        first?: boolean;
      }
    ): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    reset(): void;
  }

  export function GIFEncoder(opts?: {
    initialCapacity?: number;
    auto?: boolean;
  }): GIFEncoderInstance;

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    opts?: {
      format?: "rgb565" | "rgb444" | "rgba4444";
      oneBitAlpha?: boolean | number;
      clearAlpha?: boolean;
      clearAlphaThreshold?: number;
      clearAlphaColor?: number;
    }
  ): Palette;

  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: Palette,
    format?: "rgb565" | "rgb444" | "rgba4444"
  ): Uint8Array;

  export function nearestColorIndex(
    palette: Palette,
    pixel: number[] | Uint8Array
  ): number;
}
