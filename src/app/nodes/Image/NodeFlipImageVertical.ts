import { register } from 'local/Registry';
import { ImageTransformationFunction } from 'local/types/TypeImage';
import { NodeImageTransformation } from './NodeImageTransformation';

/**
 * @classdesc Flips an image vertically (across the Y axis)
 * @author Orlando
 */
@register
export class NodeFlipImageVertical extends NodeImageTransformation {
  constructor() {
    super(
      'Flip Image Vertically',
      'Flips an image vertically (across the Y axis)'
    );
  }

  protected transformation: ImageTransformationFunction = (
    canvas,
    ctx,
    img
  ) => {
    ctx.scale(1, -1);
    ctx.drawImage(img, 0, -canvas.height);
  };
}
