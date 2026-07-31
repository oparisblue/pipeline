/**
 * The settings used when encoding a GIF.
 */
export interface GifOptions {
  /** How many frames per second to sample from the source video. Clamped to 1-50. */
  fps: number;

  /**
   * The output width in pixels. Zero (or negative) means "use the source video's width".
   * The height is always derived from the video's aspect ratio.
   */
  width: number;
}
