import { ConnectionPoint } from "ConnectionPoint";
import { DataType } from "DataType";

/**
 * @classdesc Represents a choice between a fixed set of string options, rendered as a
 * dropdown. Subclasses define the available options by implementing `getOptions()` - note
 * that this must be a method (not a field), as it is called from the `DataType`
 * constructor, before any subclass fields would have been initialised.
 * @author Simon
 */
export abstract class TypeOption extends DataType {
  /**
   * @return The options the user can pick between. The first option is the default.
   */
  public abstract getOptions(): string[];

  public cast(other: any): any {
    // Fall back to the default option rather than holding a "no value" state
    if (other == null || other === "") return this.defaultValue();

    let option = String(other);

    if (this.getOptions().indexOf(option) == -1)
      throw new TypeError(`"${option}" is not one of the available options!`);

    return option;
  }

  public defaultValue(): any {
    return this.getOptions()[0];
  }

  public getHexColour(): string {
    return "#8BC34A";
  }

  public getName(): string {
    return "Option";
  }

  public makeControl(point: ConnectionPoint, disabled: boolean): HTMLElement {
    let select = document.createElement("select");

    for (let option of this.getOptions()) {
      let element = document.createElement("option");
      element.value = option;
      element.innerText = option;
      select.appendChild(element);
    }

    select.value = this.getValue();
    select.disabled = disabled;

    select.onchange = () => {
      point.setValue(select.value, true);
    };

    this.control = select;

    return select;
  }

  public updateControl(disabled: boolean, value: any): void {
    let select = <HTMLSelectElement>this.control;
    select.disabled = disabled;
    select.value = value;
  }

  public doPreviewRender(element: HTMLElement): void {
    element.innerHTML = `<div>${this.getValue()}</div>`;
  }
}
