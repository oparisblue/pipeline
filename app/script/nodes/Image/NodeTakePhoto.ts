/**
* @classdesc Take a photo using your webcam.
* @author Orlando
*/
@register
class NodeTakePhoto extends NodeElement {
	
	constructor() {
		super();
		
		// Take photo button UI
		let takePhotoButton = document.createElement("div");
		takePhotoButton.classList.add("liveMediaButton");
		takePhotoButton.innerHTML = `<i class="mdi mdi-camera"></i>`;
		takePhotoButton.onclick = ()=>{
			let status = (<PreviewFromCamera> this.preview).takePhoto();
			// Switch icon between those for take and retake
			takePhotoButton.innerHTML = `<i class="mdi mdi-${status == CameraFeedState.LIVE ? "camera" : "refresh"}"></i>`;
		}
		
		this
			.setProperties ({name: "Take Photo",  description: "Take a photo using your webcam", path: "Image"})
			.addOutlet     ({name: "Photo",       description: "The photo",                      type: new TypeImage()})
			.setPreview    (new PreviewFromCamera(this.outlets[0]))
			.setTopUI(takePhotoButton)
			.build();
    }
	
	protected apply(resolve: Function, _reject: Function): void {
		resolve();
    }
	
	protected onBeforeDelete(): void {
		// Ensure that we turn off the camera before deleting the node
		(<PreviewFromCamera> this.preview).endStream();
	}
	
}