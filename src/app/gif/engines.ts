import { FfmpegEngine } from "./FfmpegEngine";
import { GifencEngine } from "./GifencEngine";
import { GifEngine } from "./GifEngine";

// All of the available GIF encoding engines. The first entry is the default.
export const gifEngines: GifEngine[] = [new GifencEngine(), new FfmpegEngine()];

/**
 * Find an engine by its name, falling back to the default engine.
 */
export function getGifEngine(name: string): GifEngine {
  for (let engine of gifEngines) {
    if (engine.getName() == name) return engine;
  }

  return gifEngines[0];
}
