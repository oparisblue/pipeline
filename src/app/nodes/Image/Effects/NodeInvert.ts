import { register } from 'local/Registry';
import { NodeImageTransformation } from 'local/nodes/Image/NodeImageTransformation';
import { ImageTransformationFunction } from 'local/types/TypeImage';

/**
 * @classdesc Invert the colours of the image
 * @author Orlando
 */
@register
export class NodeInvert extends NodeImageTransformation {
  constructor() {
    super('Invert', 'Invert the colours of the image', '/Effects');
  }

  protected transformation: ImageTransformationFunction = (
    canvas,
    ctx,
    _img
  ) => {
    // Get all of the pixels in the image in the form [R, G, B, A, R, G, B, A, ...]
    let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = data.data;

    for (let i = 0; i < pixels.length; i += 4) {
      // Subtract each of the current values from 255 (the maximum) to get the colour on the other side of the colour wheel
      pixels[i] = 255 - pixels[i];
      pixels[i + 1] = 255 - pixels[i + 1];
      pixels[i + 2] = 255 - pixels[i + 2];
    }

    // Apply the transformations to the canvas
    ctx.putImageData(data, 0, 0);
  };
}
