/**
* @classdesc Represents decimal numbers.
* @author Orlando
*/
class TypeNumber extends DataType {
	
	public cast(other: any): any {
		// Special-case: cast booleans (true => 1 and false => 0)
		if (other === true || other === false) return other + 0;
		
		// Special-case: empty string => default value
		if (other === "") return this.defaultValue();
		
		let number = parseFloat(other);
		
		if (isNaN(number)) throw new TypeError("Could not convert to a number!");
		
		return number;
	}
	
    public defaultValue(): any {
        return 0;
    }
	
	getHexColour(): string {
        return "#03A9F4";
    }
	
	public makeControl(point: ConnectionPoint, disabled: boolean): HTMLElement {
        let input = document.createElement("input");
		input.type = "number";
		input.value = this.getValue();
		input.disabled = disabled;
		
		input.oninput = ()=>{
			point.setValue(input.value, true);
		}
		
		input.onblur = ()=>{
			input.value = this.getValue();
		}
		
		this.control = input;
		
		return input;
    }
	
	updateControl(disabled: boolean, value: any): void {
		let input = <HTMLInputElement> this.control;
        input.disabled = disabled;
		input.value = value;
    }
	
	doPreviewSetup(element: HTMLElement): void {
		element.classList.add("previewNumber");
	}
	
	doPreviewRender(element: HTMLElement): void {
		element.innerHTML = `<div>${this.getValue().toLocaleString("en-US")}</div>`;
    }
	
}