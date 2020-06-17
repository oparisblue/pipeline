/**
* @classdesc Loads an image from a file.
* @author Orlando
*/
@register
@fileFormat([0x89504E47], ["image/png"], ["png"])
@fileFormat([0xFFD8FFD8, 0xFFD8FFE0, 0xFFD8FFEE, 0xFFD8FFE1], ["image/jpeg"], ["jpg", "jpeg"])
class NodeImage extends FileNodeElement {
	
	constructor() {
		super();
		
		this
			.setProperties ({name: "Image",  description: "Loads an image from a file"})
			.addOutlet     ({name: "Image",  description: "The loaded image", type: new TypeImage()})
			.setPreview    (new PreviewConnectionPoint(this.outlets[0]))
			.build();
    }
	
	public loadFile(base64: string, contentType: string[]): void {
		// Load the image
		let img = new Image();
		img.src = UploadManager.asDataURL(base64, contentType);
		img.onload = ()=>{
			this.outlets[0].setValue(img, true);
		}
    }
	
	protected apply(resolve: Function, _reject: Function): void {
		resolve();
    }
	
}