import { NodeElement } from "local/NodeElement";
import { register } from "local/Registry";
import { TypeImage } from "local/types/TypeImage";

/**
* @classdesc Split an image into its red, green and blue channels.
* @author Orlando
*/
@register
export class NodeChannels extends NodeElement {
	
	constructor() {
		super();
		
		this
			.setProperties ({name: "Channels", description: "Split an image into its red, green and blue channels", path: "Image"})
			.addInlet      ({name: "Image",    description: "The initial image",                                    type: new TypeImage()})
			.addOutlet     ({name: "Red",      description: "The red channel",                                      type: new TypeImage()})
			.addOutlet     ({name: "Green",    description: "The green channel",                                    type: new TypeImage()})
			.addOutlet     ({name: "Blue",     description: "The blue channel",                                     type: new TypeImage()})
			.setPreview    (this.inlets[0])
			.build();
    }
	
	protected apply(resolve: Function, reject: Function): void {
        
		let imgType: TypeImage = (<TypeImage> this.inlets[0].getType());
		let img = this.inlets[0].getValue();
		let channelOutlets = this.outlets;
		
		console.log(channelOutlets);
		
		// Propogate the null to the red, green and blue channels
		if (img == null) {
			this.outlets[0].setValue(null);
			this.outlets[1].setValue(null);
			this.outlets[2].setValue(null);
		}
		else {
			
			let loaded = 0;
			
			// Extract the channels
			
			// 0 => R, 1 => G, 2 => B
			for (let i = 0; i < 3; i++) {
				let newImg = imgType.performTransformation((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, _img: HTMLImageElement)=>{
					// Get all of the pixels in the image in the form [R, G, B, A, R, G, B, A, ...]
					let data   = ctx.getImageData(0, 0, canvas.width, canvas.height);
					let pixels = data.data;
					
					for (let j = 0; j < pixels.length; j += 4) {
						// Get the colour for the channel we are extracting
						let colour = pixels[j + i];
						// Set all the pixels to black
						pixels[j] = pixels[j + 1] = pixels[j + 2] = 0;
						// Set the pixel from that channel back to its original colour
						pixels[j + i] = colour;
					}
					
					// Apply the transformations to the canvas
					ctx.putImageData(data, 0, 0);
				});
				
				// When the image loads, assign the outlet value to it
				newImg.onload = ()=>{
					channelOutlets[i].setValue(newImg);
					
					// Resolve (e.g. pass the values on and redraw the node) once all three images have loaded
					if (++loaded == 3) {
						resolve();
					}
				}
			}
		}
    }
	
}