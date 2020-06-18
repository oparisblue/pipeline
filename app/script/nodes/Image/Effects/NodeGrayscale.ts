///<reference path="../NodeImageTransformation.ts" />

/**
* @classdesc Convert an image to black and white (grayscale)
* @author Orlando
*/
@register
class NodeGrayscale extends NodeImageTransformation {
	
	constructor() {
		super("Grayscale", "Convert an image to black and white (grayscale)", "/Effects");
	}
	
    protected transformation: ImageTransformationFunction = (canvas, ctx, _img)=>{
		// Get all of the pixels in the image in the form [R, G, B, A, R, G, B, A, ...]
		let data   = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let pixels = data.data;
		
		for (let i = 0; i < pixels.length; i += 4) {
			// Average the Red, Green, and Blue values together, and then set them all to the average to make the image grayscale
			pixels[i] = pixels[i + 1] = pixels[i + 2] = Math.round((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);
		}
		
		// Apply the transformations to the canvas
		ctx.putImageData(data, 0, 0);
	};	
	
}