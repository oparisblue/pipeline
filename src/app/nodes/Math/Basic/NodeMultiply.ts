import { NodeElement } from "NodeElement";
import { register } from "Registry";
import { TypeNumber } from "types";

/**
 * @classdesc Takes in two numbers, and adds them together.
 * @author Orlando
 */
@register
export class NodeMultiply extends NodeElement {
  constructor() {
    super();

    this.setProperties({
      name: "Multiply",
      description: "Multiply two numbers",
      path: "Maths/Basic"
    })
      .addInlet({
        name: "X",
        description: "The first number",
        type: new TypeNumber()
      })
      .addInlet({
        name: "Y",
        description: "The second number",
        type: new TypeNumber()
      })
      .addOutlet({
        name: "Result",
        description: "The result of X * Y",
        type: new TypeNumber()
      })
      .setPreview(this.outlets[0])
      .build();
  }

  protected apply(resolve: Function, _reject: Function): void {
    // Add the two inlet values together, and set the outlet as this result
    this.outlets[0].setValue(
      this.inlets[0].getValue() * this.inlets[1].getValue()
    );
    resolve();
  }
}
