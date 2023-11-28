import { ConnectionPoint } from 'ConnectionPoint';
import { DataType } from 'DataType';

/**
 * @classdesc Represents decimal numbers.
 * @author Orlando
 */
export class TypeNumber extends DataType {
  public cast(other: any): any {
    // Special-case: cast booleans (true => 1 and false => 0)
    if (other === true || other === false) return other + 0;

    // Special-case: empty string / null => default value
    if (other === '' || other == null) return this.defaultValue();

    let number = parseFloat(other);

    if (isNaN(number)) throw new TypeError('Could not convert to a number!');

    return number;
  }

  public defaultValue(): any {
    return 0;
  }

  public getHexColour(): string {
    return '#03A9F4';
  }

  public getName(): string {
    return 'Number';
  }

  public makeControl(point: ConnectionPoint, disabled: boolean): HTMLElement {
    let input = document.createElement('input');
    input.type = 'number';
    input.value = this.getValue();
    input.disabled = disabled;

    input.oninput = () => {
      point.setValue(input.value, true);
    };

    input.onblur = () => {
      input.value = this.getValue();
    };

    this.control = input;

    return input;
  }

  public updateControl(disabled: boolean, value: any): void {
    let input = <HTMLInputElement>this.control;
    input.disabled = disabled;
    input.value = value;
  }

  public doPreviewSetup(element: HTMLElement): void {
    element.classList.add('previewNumber');
  }

  public doPreviewRender(element: HTMLElement): void {
    element.innerHTML = `<div>${this.getValue().toLocaleString('en-US')}</div>`;
  }
}
