/**
* @classdesc Represents decimal numbers.
* @author Orlando
*/
class TypeNumber extends DataType {
	
	/** @override **/
	public cast(other: any): any {
		// Special-case: cast booleans (true => 1 and false => 0)
		if (other === true || other === false) return other + 0;
		
		let number = parseFloat(other);
		
		if (isNaN(number)) throw new TypeError("Could not convert to a number!");
		
		return number;
	}
	
	/** @override **/
    public defaultValue(): any {
        return 0;
    }
	
	getHexColour(): string {
        return "#03A9F4";
    }
	
	/** @override **/
	public makeControl(point: ConnectionPoint, disabled: boolean): HTMLElement {
        let input = document.createElement("input");
		input.type = "number";
		input.value = this.getValue();
		input.disabled = disabled;
		input.oninput = ()=>{
			point.setValue(input.value, true);
		}
		return input;
    }
	
	/** @override **/
	doPreviewSetup(element: HTMLElement): void {
		element.classList.add("previewNumber");
	}
	
	/** @override **/
	doPreviewRender(element: HTMLElement): void {
		element.innerHTML = `<div>${this.getValue().toLocaleString("en-US")}</div>`;
    }
	
}