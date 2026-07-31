import { ConnectionPoint } from "ConnectionPoint";
import { DataType } from "DataType";
import { VideoValue } from "./VideoValue";

/**
 * @classdesc Represents an uploaded video, e.g. mp4.
 * @author Simon
 */
export class TypeVideo extends DataType {
  public cast(other: any): any {
    // null is allowed
    if (other == null) return other;

    // Otherwise, it has to be a video value - e.g. a video element together with the blob
    // it was loaded from
    if (
      !(other.element instanceof HTMLVideoElement) ||
      !(other.blob instanceof Blob)
    )
      throw new TypeError("Could not convert to a video!");

    return other;
  }

  public defaultValue(): any {
    return null;
  }

  public getHexColour(): string {
    return "#FF9800";
  }

  public getName(): string {
    return "Video";
  }

  public makeControl(_point: ConnectionPoint, disabled: boolean): HTMLElement {
    this.control = document.createElement("span");
    this.control.innerHTML = this.makeVideoDescription(null);
    this.control.style.color = this.getHexColour();
    if (disabled) this.control.classList.add("disabledControl");
    return this.control;
  }

  public updateControl(disabled: boolean, value: any): void {
    this.control.setAttribute("class", disabled ? "disabledControl" : "");
    this.control.innerHTML = this.makeVideoDescription(value);
  }

  private makeVideoDescription(video: VideoValue): string {
    return `<i class="mdi mdi-video"></i> ${
      video == null
        ? "No Video"
        : `Video (${video.element.videoWidth} &times; ${
            video.element.videoHeight
          }, ${video.element.duration.toFixed(1)}s)`
    }`;
  }

  public doPreviewSetup(element: HTMLElement): void {
    element.classList.add("previewVideo");
  }

  public doPreviewRender(element: HTMLElement): void {
    let video: VideoValue = this.getValue();
    // Clear the element
    element.innerHTML = "";
    if (video == null) {
      element.innerHTML = `<div class="previewEmpty"></div>`;
    } else {
      // Make a new element so that playback in the preview does not affect the original
      let displayVideo = document.createElement("video");
      displayVideo.src = video.element.src;
      displayVideo.controls = true;
      displayVideo.muted = true;
      displayVideo.loop = true;
      displayVideo.draggable = false;
      displayVideo.style.width = "100%";
      element.appendChild(displayVideo);
    }
  }
}
