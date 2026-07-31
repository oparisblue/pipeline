import { GIFEncoder, quantize } from "gifenc";
import { VideoValue } from "types";
import { ditherFloydSteinberg } from "./ditherFloydSteinberg";
import { GifEngine } from "./GifEngine";
import { GifOptions } from "./GifOptions";

/**
 * @classdesc Encodes GIFs in pure JavaScript using the bundled gifenc library. Frames are
 * extracted by seeking a video element and drawing it to a canvas, so this works
 * out-of-the-box with no extra downloads.
 * @author Simon
 */
export class GifencEngine implements GifEngine {
  // Keep runaway conversions (e.g. a long video at a high frame rate) in check
  private static readonly MAX_FRAMES = 900;

  public getName(): string {
    return "Standard (gifenc)";
  }

  public getDescription(): string {
    return (
      "Encodes entirely in JavaScript using the bundled gifenc library, with " +
      "Floyd-Steinberg dithering. Available immediately, with good quality. " +
      `Conversions are capped at ${GifencEngine.MAX_FRAMES} frames.`
    );
  }

  public async encode(
    video: VideoValue,
    options: GifOptions,
    onProgress: (fraction: number) => void
  ): Promise<Uint8Array> {
    // Use a separate video element for seeking, so that the node previews (which share
    // the source element's URL) are not affected
    let source = document.createElement("video");
    source.src = video.element.src;
    source.muted = true;

    await this.waitForEvent(source, "loadedmetadata");

    if (source.videoWidth == 0)
      throw new Error("The video could not be loaded for frame extraction!");

    let fps = Math.min(Math.max(options.fps, 1), 50);
    let width = Math.round(
      options.width > 0 ? options.width : source.videoWidth
    );
    let height = Math.round((width * source.videoHeight) / source.videoWidth);

    let frameCount = Math.max(1, Math.floor(source.duration * fps));
    frameCount = Math.min(frameCount, GifencEngine.MAX_FRAMES);

    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext("2d", { willReadFrequently: true });

    let gif = GIFEncoder();
    let delay = 1000 / fps;

    for (let i = 0; i < frameCount; i++) {
      await this.seek(source, Math.min(i / fps, source.duration));

      ctx.drawImage(source, 0, 0, width, height);
      let rgba = ctx.getImageData(0, 0, width, height).data;

      // Build a palette for this frame, and dither the frame onto it
      let palette = quantize(rgba, 256);
      let index = ditherFloydSteinberg(rgba, width, height, palette);

      gif.writeFrame(index, width, height, { palette, delay });

      onProgress((i + 1) / frameCount);
    }

    gif.finish();
    return gif.bytes();
  }

  private seek(video: HTMLVideoElement, time: number): Promise<void> {
    // Watch for the event before changing the time, so that it cannot be missed.
    // The timeout is a safety net for the (rare) browsers which do not fire "seeked"
    // when the seek is a no-op - e.g. seeking to the already-current time
    let seeked = this.waitForEvent(video, "seeked", 2000);
    video.currentTime = time;
    return seeked;
  }

  private waitForEvent(
    target: EventTarget,
    eventName: string,
    timeout: number = 0
  ): Promise<void> {
    return new Promise((resolve) => {
      target.addEventListener(eventName, () => resolve(), { once: true });
      if (timeout > 0) setTimeout(resolve, timeout);
    });
  }
}
