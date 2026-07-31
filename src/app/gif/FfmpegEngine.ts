import { VideoValue } from "types";
import { GifEngine } from "./GifEngine";
import { GifOptions } from "./GifOptions";

/**
 * @classdesc Encodes GIFs using ffmpeg compiled to WebAssembly, with its gold-standard
 * two-pass palette pipeline. The engine assets (~31MB, mostly the wasm) are copied into
 * build/ffmpeg/ by the build scripts, and are lazy-loaded here the first time the engine
 * is used - so they never weigh down the main bundle, and users who stick to the standard
 * engine never download them at all.
 * @author Simon
 */
export class FfmpegEngine implements GifEngine {
  // The loading ffmpeg instance. Loading is started at most once and shared by every encode.
  private ffmpeg: Promise<any> = null;

  public getName(): string {
    return "High Quality (ffmpeg)";
  }

  public getDescription(): string {
    return (
      "Encodes using ffmpeg compiled to WebAssembly, with its two-pass palette " +
      "pipeline. The best quality, but the ~31MB engine has to be downloaded the " +
      "first time it is used."
    );
  }

  public async encode(
    video: VideoValue,
    options: GifOptions,
    onProgress: (fraction: number) => void
  ): Promise<Uint8Array> {
    let ffmpeg = await this.load();

    // Map ffmpeg's per-run progress onto a single scale: the palette pass is the first
    // half, and the encode pass is the second
    let pass = 0;
    let progressHandler = (event: any) => {
      let fraction = Math.min(Math.max(event.progress, 0), 1);
      onProgress(pass * 0.5 + fraction * 0.5);
    };
    ffmpeg.on("progress", progressHandler);

    try {
      await ffmpeg.writeFile(
        "input.mp4",
        new Uint8Array(await video.blob.arrayBuffer())
      );

      let fps = Math.min(Math.max(options.fps, 1), 50);
      let filters = `fps=${fps}`;
      if (options.width > 0)
        filters += `,scale=${Math.round(options.width)}:-1:flags=lanczos`;

      // Pass 1: analyse the whole video to build an optimal 256 colour palette
      let code = await ffmpeg.exec([
        "-i",
        "input.mp4",
        "-vf",
        `${filters},palettegen=stats_mode=diff`,
        "-y",
        "palette.png"
      ]);
      if (code != 0)
        throw new Error(`ffmpeg's palette pass failed (exit code ${code})`);

      pass = 1;

      // Pass 2: encode using that palette, hiding banding with error-diffusion dithering
      code = await ffmpeg.exec([
        "-i",
        "input.mp4",
        "-i",
        "palette.png",
        "-lavfi",
        `${filters} [x]; [x][1:v] paletteuse=dither=sierra2_4a`,
        "-y",
        "output.gif"
      ]);
      if (code != 0)
        throw new Error(`ffmpeg's encode pass failed (exit code ${code})`);

      return <Uint8Array>await ffmpeg.readFile("output.gif");
    } finally {
      ffmpeg.off("progress", progressHandler);

      // Clear the scratch files out of ffmpeg's in-memory file system
      for (let file of ["input.mp4", "palette.png", "output.gif"]) {
        try {
          await ffmpeg.deleteFile(file);
        } catch (error) {}
      }
    }
  }

  /**
   * Load the ffmpeg UMD build and start its worker. Runs at most once; failures reset the
   * state so that a later attempt can retry (e.g. after connectivity issues).
   */
  private load(): Promise<any> {
    if (this.ffmpeg == null) {
      this.ffmpeg = this.doLoad();

      this.ffmpeg.catch(() => {
        this.ffmpeg = null;
      });
    }

    return this.ffmpeg;
  }

  private async doLoad(): Promise<any> {
    // Load ffmpeg.js via a script tag. It finds its worker chunk (814.ffmpeg.js) relative
    // to its own URL, and the worker is then pointed at the core by the URLs below - which
    // must be absolute, as the worker resolves relative URLs against its own location
    await this.loadScript("ffmpeg/ffmpeg.js");

    // The UMD build exposes itself as a global
    let ffmpeg = new (<any>window).FFmpegWASM.FFmpeg();

    await ffmpeg.load({
      coreURL: new URL("ffmpeg/ffmpeg-core.js", document.baseURI).href,
      wasmURL: new URL("ffmpeg/ffmpeg-core.wasm", document.baseURI).href
    });

    return ffmpeg;
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(
          new Error(`Failed to load ${src} - has it been copied into build/?`)
        );
      document.head.appendChild(script);
    });
  }
}
