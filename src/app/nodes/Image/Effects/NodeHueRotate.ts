import { register } from 'Registry';
import { NodeImageTransformation } from '../NodeImageTransformation';
import { ImageTransformationFunction, TypeNumber } from 'types';
import { clamp, radians } from 'utils';

/**
 * @classdesc Hue rotate the colours of an image by a given amount of degrees
 * @author Simon, Orlando
 */

@register
export class NodeHueRotate extends NodeImageTransformation {
  private matrix: number[][];

  constructor() {
    super('Hue Rotate', 'Rotate the colours of an image', '/Effects');

    this.addInlet({
      name: 'Amount',
      description: 'The amount to rotate the colour space',
      type: new TypeNumber(),
    }).build();

    this.matrix = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
  }

  protected transformation: ImageTransformationFunction = (
    canvas,
    ctx,
    _img
  ) => {
    // Get all of the pixels in the image in the form [R, G, B, A, R, G, B, A, ...]
    let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = data.data;

    // Get the amount to rotate the colours by
    let amount = this.inlets[1].getValue() % 360;

    this.setHueRotation(amount);

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      const rx = clamp(
        r * this.matrix[0][0] + g * this.matrix[0][1] + b * this.matrix[0][2],
        0,
        255
      );
      const gx = clamp(
        r * this.matrix[1][0] + g * this.matrix[1][1] + b * this.matrix[1][2],
        0,
        255
      );
      const bx = clamp(
        r * this.matrix[2][0] + g * this.matrix[2][1] + b * this.matrix[2][2],
        0,
        255
      );

      pixels[i] = rx;
      pixels[i + 1] = gx;
      pixels[i + 2] = bx;
    }

    // Apply the transformations to the canvas
    ctx.putImageData(data, 0, 0);
  };

  private setHueRotation(degrees: number) {
    // Source: https://stackoverflow.com/questions/8507885/shift-hue-of-an-rgb-color
    const cosA = Math.cos(radians(degrees));
    const sinA = Math.sin(radians(degrees));

    this.matrix[0][0] = cosA + (1 - cosA) / 3;
    this.matrix[0][1] = (1 / 3) * (1 - cosA) - Math.sqrt(1 / 3) * sinA;
    this.matrix[0][2] = (1 / 3) * (1 - cosA) + Math.sqrt(1 / 3) * sinA;
    this.matrix[1][0] = (1 / 3) * (1 - cosA) + Math.sqrt(1 / 3) * sinA;
    this.matrix[1][1] = cosA + (1 / 3) * (1.0 - cosA);
    this.matrix[1][2] = (1 / 3) * (1 - cosA) - Math.sqrt(1 / 3) * sinA;
    this.matrix[2][0] = (1 / 3) * (1 - cosA) - Math.sqrt(1 / 3) * sinA;
    this.matrix[2][1] = (1 / 3) * (1 - cosA) + Math.sqrt(1 / 3) * sinA;
    this.matrix[2][2] = cosA + (1 / 3) * (1 - cosA);
  }
}
