import { FileNodeElement } from "FileNodeElement";
import { fileFormat, register } from "Registry";
import { TypeVideo } from "types";
import { base64ToBytes } from "utils";

/**
 * @classdesc Loads a video from a file.
 * @author Simon
 */
@register
// The first four bytes of an mp4 file hold the (variable) size of its first box, so mp4s
// cannot be identified by a magic number at offset 0 (the "ftyp" signature lives at byte
// offset 4) - rely on the content type and extension instead
@fileFormat(null, ["video/mp4"], ["mp4"])
export class NodeVideo extends FileNodeElement {
  constructor() {
    super();

    this.setProperties({
      name: "Video",
      description: "Loads a video from a file",
      path: "Video"
    })
      .addOutlet({
        name: "Video",
        description: "The loaded video",
        type: new TypeVideo()
      })
      .setPreview(this.outlets[0])
      .build();
  }

  public loadFile(base64: string, contentType: string[]): void {
    // Keep the original bytes around (as a blob) alongside the playable element - some
    // conversions (e.g. ffmpeg) work on the file itself rather than on decoded frames
    // (The cast works around newer TypeScript libs not accepting Uint8Array as a BlobPart)
    let blob = new Blob([<any>base64ToBytes(base64)], { type: contentType[0] });

    let video = document.createElement("video");
    video.src = URL.createObjectURL(blob);
    video.muted = true;

    // Wait for the metadata (dimensions, duration) so downstream nodes can rely on it
    video.onloadedmetadata = () => {
      this.outlets[0].setValue({ element: video, blob: blob }, true);
    };
  }

  protected apply(resolve: Function, _reject: Function): void {
    resolve();
  }

  protected onBeforeDelete(): void {
    let video = this.outlets[0].getValue();
    if (video != null) URL.revokeObjectURL(video.element.src);
  }
}
