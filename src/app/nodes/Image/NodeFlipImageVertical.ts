import { register } from 'Registry';
import { NodeImageTransformation } from './NodeImageTransformation';
import { ImageTransformationFunction } from 'types';

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
