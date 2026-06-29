import { VideoValue } from "types";
import { GifOptions } from "./GifOptions";

/**
 * A strategy for encoding a video into an animated GIF.
 */
export interface GifEngine {
  /**
   * @return The name of the engine, as shown in the engine dropdown.
   */
  getName(): string;

  /**
   * @return A short description of the engine's trade-offs, shown in node help.
   */
  getDescription(): string;

  /**
   * Encode the given video as an animated GIF.
   * @param video The video to convert.
   * @param options The conversion settings.
   * @param onProgress Called with a number between 0 and 1 as the encode progresses.
   * @return The encoded GIF file bytes.
   */
  encode(
    video: VideoValue,
    options: GifOptions,
    onProgress: (fraction: number) => void
  ): Promise<Uint8Array>;
}
