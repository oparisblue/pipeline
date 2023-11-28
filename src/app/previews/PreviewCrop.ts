import { Preview } from "local/Preview";
import { NodeCrop } from "../nodes";

/**
* @classdesc Preview an image with a crop rectangle control overlay.
* @author Orlando
*/
export class PreviewCrop implements Preview {
	
	private node: NodeCrop;
	private element: HTMLElement;
	private canvas: HTMLCanvasElement = null;
	private image: HTMLImageElement = new Image();
	
	constructor(node: NodeCrop) {
		this.node = node;
		this.image.draggable = false;
	}
	
    setup(element: HTMLElement): void {
		this.element = element;
		this.element.classList.add("previewCrop")
    }
	
    render(): void {
		let img = this.node.inlets[0].getValue();
		
		if (img == null) {
			this.element.innerHTML = `<div class="previewEmpty"></div>`;
			this.canvas = null;
		}
		else {
			// Set the image src
			this.image.src = img.src;

			// Make the canvas if we haven't already
			if (this.canvas == null) {
				// Clear the current preview
				this.element.innerHTML = "";
				
				// Create the canvas and add it to the preview
				this.canvas = document.createElement("canvas");
				this.element.appendChild(this.canvas);
				this.element.appendChild(this.image);
			}
			
			// Reset the canvas width and height
			this.canvas.width  = img.width;
			this.canvas.height = img.height;
			
			// Find the values for each of the four points of the crop rectangle
			let x0 = this.node.inlets[1].getValue();
			let y0 = this.node.inlets[2].getValue();
			let x1 = this.node.inlets[3].getValue();
			let y1 = this.node.inlets[4].getValue();
			
			// Render the image to a canvas
			let ctx = this.canvas.getContext("2d");
			
			// Grey-out the area not in the crop window
			
			// Outer rectangle
			ctx.rect(0, 0, this.canvas.width, this.canvas.height);
			
			// Inner rectangle
			ctx.moveTo(x0, y0);
			ctx.rect(x0, y0, x1-x0, y1-y0);
			ctx.fillStyle = "#000B";
			ctx.fill("evenodd"); // https://en.wikipedia.org/wiki/Even%E2%80%93odd_rule
		}
		
		// Update the line positions in case the size of the node changed
		this.node.updatePlugPositions();
    }
	
}