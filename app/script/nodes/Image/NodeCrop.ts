///<reference path="./NodeImageTransformation.ts" />

/**
* @classdesc Crop an image.
* @author Orlando
*/
@register
class NodeCrop extends NodeImageTransformation {
	
	constructor() {
		super("Crop", "Crop an image");
		
		this
			.addInlet({name: "Top-Left X",     description: "The X (horizontal) position of crop rectangle's top-left corner", type: new TypeNumber()})
			.addInlet({name: "Top-Left Y",     description: "The Y (vertical) position of crop rectangle's top-left corner", type: new TypeNumber()})
			.addInlet({name: "Bottom-Right X", description: "The X (horizontal) position of crop rectangle's bottom-right corner", type: new TypeNumber()})
			.addInlet({name: "Bottom-Right Y", description: "The Y (vertical) position of crop rectangle's bottom-right corner", type: new TypeNumber()})
			.setPreview(new PreviewCrop(this))
			.build()
	}
	
    protected transformation: ImageTransformationFunction = (canvas, ctx, img)=>{
		if (img == null) return;
		
		// By default, crop to get the entire image
		if (this.inlets[3].getValue() == 0 && this.inlets[4].getValue() == 0) {
			this.inlets[3].setValue(img.width);
			this.inlets[4].setValue(img.height);
		}
		
		// Get the values of the inlets
		let x0 = this.inlets[1].getValue();
		let y0 = this.inlets[2].getValue();
		let x1 = this.inlets[3].getValue();
		let y1 = this.inlets[4].getValue();
		
		// Resize the image
		canvas.width  = x1 - x0;
		canvas.height = y1 - y0;
		
		// Draw just the requested portion of the image
		ctx.drawImage(img, x0, y0, x1 - x0, y1 - y0, 0, 0, canvas.width, canvas.height);		
	};
	
}