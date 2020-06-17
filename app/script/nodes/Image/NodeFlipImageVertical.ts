///<reference path="./NodeImageTransformation.ts" />

/**
* @classdesc Flips an image vertically (across the Y axis)
* @author Orlando
*/
@register
class NodeFlipImageVertical extends NodeImageTransformation {
	
	constructor() {
		super("Flip Image Vertically", "Flips an image vertically (across the Y axis)");
	}
	
    protected transformation: ImageTransformationFunction = (canvas, ctx, img)=>{
		ctx.scale(1, -1);
		ctx.drawImage(img, 0, -canvas.height);
	};	
	
}