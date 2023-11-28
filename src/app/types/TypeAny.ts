import { ConnectionPoint } from 'local/ConnectionPoint';
import { DataType } from 'local/DataType';
import { TypeUnknown } from './TypeUnknown';

/**
 * @classdesc Represents _any_ type. For meta operations, like Split, etc.
 * @author Orlando
 */
export class TypeAny extends DataType {
  private otherType: DataType = new TypeUnknown();

  public cast(other: any): any {
    // Anything is valid!
    return other;
  }

  public defaultValue(): any {
    return null;
  }

  public getActualHexColour(): string {
    return '#FFC107';
  }

  public makeControl(_point: ConnectionPoint, _disabled: boolean): HTMLElement {
    this.control = document.createElement('span');
    this.changeControlText();
    return this.control;
  }

  // The plan here is to save the type of the other object whenever it is passed in,
  // and then just return its values / perform its commands to generate the colour,
  // name and preview.

  // Note that this approach also allows for type data to flow through multiple sets
  // of Any types.

  public setValue(newValue: any, type: DataType): void {
    super.setValue(newValue, type);

    this.otherType = type;

    this.changeControlText();
  }

  public doPreviewRender(element: HTMLElement): void {
    // Clear the current preview, and reset the preview window
    element.innerHTML = '';
    element.setAttribute('class', 'preview');

    // Attempt to show a preview based off of the other type
    this.otherType.doPreviewSetup(element);
    this.otherType.doPreviewRender(element);
  }

  public getHexColour(): string {
    return this.otherType.getHexColour();
  }

  public getName(): string {
    return this.otherType.getName();
  }

  private changeControlText(): void {
    this.control.innerHTML = this.getName();
    this.control.style.color = this.getHexColour();
  }

  /**
   * Get the _actual_ data type of the value stored in this Any node.
   */
  public getOtherType(): DataType {
    return this.otherType;
  }
}
