import { NodeElement } from 'NodeElement';
import { register } from 'Registry';
import { TypeImage, TypeNumber } from 'types';

/**
 * @classdesc Get information about an image (e.g. width and height).
 * @author Orlando
 */
@register
class NodeImageInfo extends NodeElement {
  constructor() {
    super();

    this.setProperties({
      name: 'Image Info',
      description: 'Get information about an image (e.g. width and height)',
      path: 'Image',
    })
      .addInlet({
        name: 'Image',
        description: 'The image',
        type: new TypeImage(),
      })
      .addOutlet({
        name: 'Width',
        description: 'The width of the image (in pixels)',
        type: new TypeNumber(),
      })
      .addOutlet({
        name: 'Height',
        description: 'The height of the image (in pixels)',
        type: new TypeNumber(),
      })
      .setPreview(this.inlets[0])
      .build();
  }

  protected apply(resolve: Function, _reject: Function): void {
    let img = this.inlets[0].getValue();

    this.outlets[0].setValue(img == null ? 0 : img.width);
    this.outlets[1].setValue(img == null ? 0 : img.height);

    resolve();
  }
}
