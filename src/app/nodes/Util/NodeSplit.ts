import { DataType } from 'DataType';
import { NodeElement } from 'NodeElement';
import { register } from 'Registry';
import { TypeAny } from 'types';

/**
 * @classdesc Takes in something of any type, produces two exact copies of it
 * @author Orlando
 */
@register
export class NodeSplit extends NodeElement {
  constructor() {
    super();

    this.setProperties({
      name: 'Split',
      description: 'Splits one input into two identical outputs',
      path: 'Utility',
    })
      .addInlet({
        name: 'Input',
        description: 'Something to clone',
        type: new TypeAny(),
      })
      .addOutlet({
        name: 'Clone 1',
        description: 'A clone of Input',
        type: new TypeAny(),
      })
      .addOutlet({
        name: 'Clone 2',
        description: 'A clone of Input',
        type: new TypeAny(),
      })
      .setPreview(this.inlets[0])
      .build();
  }

  protected apply(resolve: Function, _reject: Function): void {
    // Find the type of the inlet - the outlets' type should match it!
    let type: DataType = (<TypeAny>this.inlets[0].getType()).getOtherType();

    // Just send the input value to both outlets
    this.outlets[0].setValue(this.inlets[0].getValue(), false, false, type);
    this.outlets[1].setValue(this.inlets[0].getValue(), false, false, type);
    resolve();
  }
}
