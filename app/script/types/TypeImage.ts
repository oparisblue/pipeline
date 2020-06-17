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
	
	/**
	* Apply a transformation to the image contained in this type, and get a _new_ image back.
	* @param {ImageTransformationFunction} transformation A lambda that takes a canvas rendering context with the
	* image already drawn to it, as well the canvas itself, and a copy of the image. In this lambda, you can then
	* change the canvas state however you want, and what is on it at the end will become the new image value!
	* @return {TypeImage} A new image type containing the result of applying that transformation.
	*/
	public performTransformation(transformation: ImageTransformationFunction): HTMLImageElement {
		let img: HTMLImageElement = this.getValue();
		
		// If the image is null, nothing can be done to it - the output should just always be null
		if (img == null) return null;
		
		// Create a canvas of the same width and height as the image
		let canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		
		// Find the canvas's rendering context
		let ctx = canvas.getContext("2d");
		
		// Draw the image to the canvas
		ctx.drawImage(img, 0, 0);
		
		// Apply the transformation function
		transformation(canvas, ctx, img);
		
		// Read out the canvas's content to a data URL, and use this to make a new image
		let newImg = new Image();
		// File format doesn't matter at this point, so just always use PNG because it supports transparency, meaning
		// that there's no risk of losing data.
		newImg.src = canvas.toDataURL("image/png");
		
		return newImg;
	}
}

type ImageTransformationFunction = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: HTMLImageElement) => void;