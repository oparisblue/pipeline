import { register } from "Registry";
import { NodeImageTransformation } from "./NodeImageTransformation";
import { ImageTransformationFunction, TypeNumber } from "types";

/**
 * @classdesc Resize an image to the given width and height.
 * @author Simon
 */
@register
export class NodeResize extends NodeImageTransformation {
  constructor() {
    super("Resize", "Resize an image to the given width and height");

    this.addInlet({
      name: "Width",
      description: "The target width of the resized image, in pixels",
      type: new TypeNumber()
    })
      .addInlet({
        name: "Height",
        description: "The target height of the resized image, in pixels",
        type: new TypeNumber()
      })
      .build();
  }

  protected transformation: ImageTransformationFunction = (
    canvas,
    ctx,
    img
  ) => {
    if (img == null) return;

    // Default to the source image's dimensions if no size has been set yet
    if (this.inlets[1].getValue() == 0 && this.inlets[2].getValue() == 0) {
      this.inlets[1].setValue(img.width);
      this.inlets[2].setValue(img.height);
    }

    let width = this.inlets[1].getValue();
    let height = this.inlets[2].getValue();

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);
  };
}
