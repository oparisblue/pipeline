/**
* @classdesc A base class containing all the boilerplate code for nodes that do some combination of
* image in -> transformed image out
* @author Orlando
*/
abstract class NodeImageTransformation extends NodeElement {
	
	constructor(name: string, description: string) {
		super();
		
		this
			.setProperties ({name: name,     description: description,             path: "Image"})
			.addInlet      ({name: "Image",  description: "The initial image",     type: new TypeImage()})
			.addOutlet     ({name: "Output", description: "The transformed image", type: new TypeImage()})
			.setPreview    (this.outlets[0])
			.build();
    }
	
	protected apply(resolve: Function, _reject: Function): void {
		// Apply the transformation function
		let img = (<TypeImage> this.inlets[0].getType()).performTransformation(this.transformation);
		
		// Once the image has been transformed, send the transformed image to the outlet
		img.onload = ()=>{
			this.outlets[0].setValue(img);
			resolve();
		}
    }
	
	/**
	* Perform the image transformation here!
	*/
	protected abstract transformation: ImageTransformationFunction
	
}