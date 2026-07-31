import { getGifEngine, gifEngines, TypeGifEngine } from "gif";
import { NodeElement } from "NodeElement";
import { register } from "Registry";
import { TypeImage, TypeNumber, TypeVideo, VideoValue } from "types";
import { bytesToBase64 } from "utils";

/**
 * @classdesc Convert a video into an animated GIF.
 * @author Simon
 */
@register
export class NodeVideoToGif extends NodeElement {
  // How long to wait after an inlet changes before starting an (expensive) encode, so
  // that e.g. typing into the FPS field does not kick off an encode per keystroke
  private static readonly DEBOUNCE_MS = 300;

  // Incremented on every change; lets superseded encodes notice that they are stale
  private generation: number = 0;

  // Encodes run strictly one after another, as the engines (particularly ffmpeg's single
  // worker) do not handle concurrent jobs
  private encodeChain: Promise<void> = Promise.resolve();

  private statusUI: HTMLElement;

  constructor() {
    super();

    this.statusUI = document.createElement("div");

    let engineHelp = gifEngines
      .map(
        (engine) =>
          `<li><b>${engine.getName()}</b>: ${engine.getDescription()}</li>`
      )
      .join("");

    this.setProperties({
      name: "Video to GIF",
      description: "Convert a video into an animated GIF",
      help:
        `Converts a video into an animated GIF.<br><br>` +
        `The available engines are:<ul>${engineHelp}</ul>` +
        `FPS is clamped between 1 and 50. Set Width to 0 to use the source video's ` +
        `width - the height always follows the video's aspect ratio.`,
      path: "Video"
    })
      .addInlet({
        name: "Video",
        description: "The video to convert",
        type: new TypeVideo()
      })
      .addInlet({
        name: "Engine",
        description: "The encoding engine to use",
        type: new TypeGifEngine()
      })
      .addInlet({
        name: "FPS",
        description: "How many frames per second to sample",
        type: new TypeNumber(10)
      })
      .addInlet({
        name: "Width",
        description: "The output width in pixels (0 = source width)",
        type: new TypeNumber(480)
      })
      .addOutlet({
        name: "GIF",
        description: "The encoded GIF",
        type: new TypeImage()
      })
      .setPreview(this.outlets[0])
      .setBottomUI(this.statusUI)
      .build();
  }

  protected apply(resolve: Function, reject: Function): void {
    let generation = ++this.generation;

    let video: VideoValue = this.inlets[0].getValue();

    if (video == null) {
      this.setStatus("");
      this.outlets[0].setValue(null);
      resolve();
      return;
    }

    // Wait briefly before encoding, in case this change is immediately superseded
    setTimeout(() => {
      if (generation != this.generation) {
        reject();
        return;
      }

      this.encodeChain = this.encodeChain.then(() =>
        this.encode(generation, video, resolve, reject)
      );
    }, NodeVideoToGif.DEBOUNCE_MS);
  }

  private encode(
    generation: number,
    video: VideoValue,
    resolve: Function,
    reject: Function
  ): Promise<void> {
    // A newer change arrived while an earlier encode held the queue
    if (generation != this.generation) {
      reject();
      return Promise.resolve();
    }

    let engine = getGifEngine(this.inlets[1].getValue());

    this.setStatus("Encoding&hellip;");

    return engine
      .encode(
        video,
        {
          fps: this.inlets[2].getValue(),
          width: this.inlets[3].getValue()
        },
        (fraction) => {
          if (generation == this.generation)
            this.setStatus(`Encoding&hellip; ${Math.round(fraction * 100)}%`);
        }
      )
      .then(
        (bytes) =>
          new Promise<void>((done) => {
            if (generation != this.generation) {
              reject();
              done();
              return;
            }

            // Wrap the GIF in an image element. Browsers animate GIF images natively, so
            // this previews correctly, and keeping the encoded bytes in the data URL
            // means the GIF download strategy can save the real file rather than a
            // flattened single frame
            let img = new Image();
            img.src = "data:image/gif;base64," + bytesToBase64(bytes);
            img.onload = () => {
              this.setStatus(this.formatSize(bytes.length));
              this.outlets[0].setValue(img);
              resolve();
              done();
            };
            img.onerror = () => {
              this.setStatus("The encoded GIF could not be displayed!");
              this.outlets[0].setValue(null);
              resolve();
              done();
            };
          })
      )
      .catch((error) => {
        this.setStatus(`<span style="color: #f44336;">${error}</span>`);
        this.outlets[0].setValue(null);
        resolve();
      });
  }

  private setStatus(message: string): void {
    this.statusUI.innerHTML =
      message == "" ? "" : `<div class="noResults">${message}</div>`;
  }

  private formatSize(bytes: number): string {
    return bytes >= 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
      : `${Math.round(bytes / 1024)} KB`;
  }
}
