import { FileNodeElement } from "FileNodeElement";
import { fileFormat, register } from "Registry";
import { UploadManager } from "UploadManager";
import { TypeImage } from "types";

/**
 * @classdesc Loads an image from a file.
 * @author Orlando
 */
@register
@fileFormat([0x89504e47], ["image/png"], ["png"])
@fileFormat(
  [0xffd8ffd8, 0xffd8ffe0, 0xffd8ffee, 0xffd8ffe1],
  ["image/jpeg"],
  ["jpg", "jpeg"]
)
export class NodeImage extends FileNodeElement {
  constructor() {
    super();

    this.setProperties({
      name: "Image",
      description: "Loads an image from a file"
    })
      .addOutlet({
        name: "Image",
        description: "The loaded image",
        type: new TypeImage()
      })
      .setPreview(this.outlets[0])
      .build();
  }

  public loadFile(base64: string, contentType: string[]): void {
    // Load the image
    let img = new Image();
    img.src = UploadManager.asDataURL(base64, contentType);
    img.onload = () => {
      this.outlets[0].setValue(img, true);
    };
  }

  protected apply(resolve: Function, _reject: Function): void {
    resolve();
  }
}
