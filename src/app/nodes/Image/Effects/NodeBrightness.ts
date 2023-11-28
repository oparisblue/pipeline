import { register } from 'local/Registry';
import { ImageTransformationFunction } from 'local/types/TypeImage';
import { TypeNumber } from 'local/types/TypeNumber';
import { NodeImageTransformation } from 'local/nodes/Image/NodeImageTransformation';

/**
 * @classdesc Brighten or darken an image
 * @author Orlando
 */
@register
export class NodeBrightness extends NodeImageTransformation {
  constructor() {
    super('Brightness', 'Brighten or darken an image', '/Effects');

    this.addInlet({
      name: 'Amount',
      description:
        'The amount to brighten (or, if negative, darken) the image by',
      type: new TypeNumber(),
    }).build();
  }

  protected transformation: ImageTransformationFunction = (
    canvas,
    ctx,
    _img
  ) => {
    // Get all of the pixels in the image in the form [R, G, B, A, R, G, B, A, ...]
    let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = data.data;

    // Get the amount to brighten or darken the image by
    let amount = this.inlets[1].getValue();

    for (let i = 0; i < pixels.length; i += 4) {
      // Add the same number to each of the red, green, blue values to increase / decrease brightness
      pixels[i] += amount;
      pixels[i + 1] += amount;
      pixels[i + 2] += amount;
    }

    // Apply the transformations to the canvas
    ctx.putImageData(data, 0, 0);
  };
}
