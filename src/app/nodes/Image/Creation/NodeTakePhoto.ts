import { NodeElement } from "NodeElement";
import { CameraFeedState, PreviewFromCamera } from "previews";
import { register } from "Registry";
import { TypeImage } from "types";

/**
 * @classdesc Take a photo using your webcam.
 * @author Orlando
 */
@register
export class NodeTakePhoto extends NodeElement {
  constructor() {
    super();

    // Take photo button UI
    let takePhotoButton = document.createElement("div");
    takePhotoButton.classList.add("liveMediaButton");
    takePhotoButton.innerHTML = `<i class="mdi mdi-camera"></i>`;
    takePhotoButton.onclick = () => {
      let status = (this.preview as PreviewFromCamera).takePhoto();
      // Switch icon between those for take and retake
      takePhotoButton.innerHTML = `<i class="mdi mdi-${
        status == CameraFeedState.LIVE ? "camera" : "refresh"
      }"></i>`;
    };

    this.setProperties({
      name: "Take Photo",
      description: "Take a photo using your webcam",
      path: "Image/Creation"
    })
      .addOutlet({
        name: "Photo",
        description: "The photo",
        type: new TypeImage()
      })
      .setPreview(new PreviewFromCamera(this.outlets[0]))
      .setTopUI(takePhotoButton)
      .build();
  }

  protected apply(resolve: Function, _reject: Function): void {
    resolve();
  }

  protected onBeforeDelete(): void {
    // Ensure that we turn off the camera before deleting the node
    (this.preview as PreviewFromCamera).endStream();
  }
}
