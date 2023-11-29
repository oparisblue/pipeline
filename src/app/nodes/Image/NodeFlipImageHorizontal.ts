import { register } from "Registry";
import { NodeImageTransformation } from "./NodeImageTransformation";
import { ImageTransformationFunction } from "types";

/**
 * @classdesc Flips an image horizontally (across the X axis)
 * @author Orlando
 */
@register
export class NodeFlipImageHorizontal extends NodeImageTransformation {
  constructor() {
    super(
      "Flip Image Horizontally",
      "Flips an image horizontally (across the X axis)"
    );
  }

  protected transformation: ImageTransformationFunction = (
    canvas,
    ctx,
    img
  ) => {
    ctx.scale(-1, 1);
    ctx.drawImage(img, -canvas.width, 0);
  };
}
