import { TypeUnknown } from "types";
import { DataType } from "./DataType";
import { IOSide } from "./IOSide";
import { NodeElement } from "./NodeElement";

export class ConnectionPoint {
  private name: string;
  private description: string;
  private type: DataType;
  private node: NodeElement;
  private link: ConnectionPoint = null;

  // The X and Y position of the center of the connection point (where the lines are drawn from)
  public x: number;
  public y: number;

  public side: IOSide;

  constructor(
    name: string,
    description: string,
    type: DataType,
    node: NodeElement
  ) {
    this.name = name;
    this.description = description;
    this.type = type;
    this.node = node;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  /**
   * Set the value stored in this connection point, casting the type (if possible).
   * @param {any} newValue The new value for the connection point.
   * @param {boolean} updateNode Optional (default `false`). When `true`, this updates the node, when `false` it doesn't.
   * @param {boolean} updateInlets Optional (default `false`). If this and `updateNode` are both true, then the value / disabled state of inlet controls is also updated
   * @param {DataType} otherType Optional (default `TypeUnknown`). The original type of the value. Note that this does not have to be provided, and can often be successfuly calculated instead.
   * @throws {TypeError} If the attempted cast is not possible.
   */
  public setValue(
    newValue: any,
    updateNode: boolean = false,
    updateInlets: boolean = false,
    otherType: DataType = null
  ): void {
    // Try to work out the incoming type.
    // It starts always being unknown. If specified in the call to this function, use the specified type instead.
    // Otherwise, this is an inlet being driven by a link, the type is whatever the type of the outlet driving it is.
    let type = new TypeUnknown();
    if (otherType != null) type = otherType;
    else if (this.side == IOSide.Input && this.hasLink())
      type = this.link.getType();

    // Set the value as stored in the data-type. This throws an error if a valid cast cannot be made.
    this.type.setValue(newValue, type);

    // Update the node
    if (updateNode) this.node.update(updateInlets);
  }

  public getValue(): any {
    return this.type.getValue();
  }

  public getType(): DataType {
    return this.type;
  }

  /**
   * Update the node on the other end of this connection point, if such a link exists.
   */
  public updateLinkedNode(): void {
    // If there is a connection
    if (this.link != null) {
      // Update the value of the connection at the linked node, triggering an update of that node
      this.link.setValue(this.getValue(), true, true);
    }
  }

  public setLinkedNode(link: ConnectionPoint): void {
    this.link = link;
  }

  public getLinkedNode(): ConnectionPoint {
    return this.link;
  }

  /**
   * @return `true` if this connection point is linked to another connection point; `false` otherwise.
   */
  public hasLink(): boolean {
    return this.link != null;
  }

  /**
   * @return The node this connection point belongs to.
   */
  public getNode(): NodeElement {
    return this.node;
  }
}
