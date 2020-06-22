///<reference path="../NodeImageTransformation.ts" />

/**
* @classdesc Threshold an image - e.g. every pixel under the threshold value is black, every pixel over it is white.
* @author Orlando
*/
@register
class NodeThreshold extends NodeImageTransformation {
	
	constructor() {
		super("Threshold", "Threshold an image - e.g. every pixel under the threshold value is black, every pixel over it is white", "/Effects");
		
		// Set the initial threshold value to be halfway (e.g. pure gray)
		let initialValue = new TypeNumber();
		initialValue.setValue(128, null);
		
		this.addInlet({name: "Threshold", description: "The threshold value", type: initialValue}).build();
	}
	
    protected transformation: ImageTransformationFunction = (canvas, ctx, _img)=>{
		// Get all of the pixels in the image in the form [R, G, B, A, R, G, B, A, ...]
		let data   = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let pixels = data.data;
		
		// Get the threshold value
		let threshold = this.inlets[1].getValue();
		
		for (let i = 0; i < pixels.length; i += 4) {
			// Much like grayscale, but do a comparison on the average rather than setting the pixels back to it
			let avg = Math.round((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);
			pixels[i] = pixels[i + 1] = pixels[i + 2] = avg < threshold ? 0 : 255;
		}
		
		// Apply the transformations to the canvas
		ctx.putImageData(data, 0, 0);
	};	
	
}