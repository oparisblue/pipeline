/**
* @classdesc Represents static images, e.g. png, and jpg. For gif, see // TODO
* @author Orlando
*/
class TypeImage extends DataType {
	
	public cast(other: any): any {
		
		// null is allowed
		if (other == null) return other;
		
		// Otherwise, it has to be an HTML image
		if (!(other instanceof Image)) throw new TypeError("Could not convert to an image!");
		
		// Also ensure that the image has loaded
		// !other.complete => if the image has not yet finished loading
		// other.naturalHeight == 0 => if the image has a height == 0 then it has not loaded correctly
		// In these cases, we would rather have a null than a broken image
		
		if (!other.complete || other.naturalHeight == 0) return null;
		
		return other;
	}
	
    public defaultValue(): any {
        return null;
    }
	
	public getHexColour(): string {
        return "#E91E63";
    }
	
	public getName(): string {
        return "Image";
    }
	
	public makeControl(_point: ConnectionPoint, disabled: boolean): HTMLElement {
    	this.control = document.createElement("span");
		this.control.innerHTML = this.makeImageDescription(null);
		this.control.style.color = this.getHexColour();
		if (disabled) this.control.classList.add("disabledControl");
		return this.control;
    }
	
	public updateControl(disabled: boolean, value: any): void {
		this.control.setAttribute("class", disabled ? "disabledControl" : "");
		this.control.innerHTML = this.makeImageDescription(value);
    }
	
	private makeImageDescription(img: HTMLImageElement): string {
		return `<i class="mdi mdi-file-image"></i> ${img == null ? "No Image" : `Image (${img.width} &times; ${img.height})`}`;
	}
	
	public doPreviewSetup(element: HTMLElement): void {
		element.classList.add("previewImage");
	}
	
	public doPreviewRender(element: HTMLElement): void {
		let img: HTMLImageElement = this.getValue();
		// Clear the element
		element.innerHTML = "";
		if (img != null) {
			// Make a copy of the image so that properties of the original (e.g. width and height) do not get modified
			let displayImg = new Image();
			displayImg.src = img.src;
			
			displayImg.draggable = false;
			element.appendChild(displayImg);
		}
    }
	
}