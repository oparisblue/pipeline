import { ConnectionPoint } from "local/ConnectionPoint";
import { Preview } from "local/Preview";

/**
* @classdesc Preview camera input.
* @author Orlando
*/
export class PreviewFromCamera implements Preview {
	
	private point: ConnectionPoint;
	private element: HTMLElement;
	
	// Should the preview display the live feed from the camera?
	private live: boolean = true;
	
	// Keep track of the camera stream, so that we can close it when we need to
	private stream: MediaStream;
	
	// The video element in which the live feed is shown
	private video: HTMLVideoElement;
	
	constructor(point: ConnectionPoint) {
		this.point = point;
	}
	
    setup(element: HTMLElement): void {
		this.element = element;
		this.element.classList.add("previewVideo");
		this.startLiveFeed();
    }
	
    render(): void {}
	
	/**
	* Toggle whether we show the live feed or not.
	* If we are transitioning from live to still, also send the still image to the outlet.
	*/
	public takePhoto(): CameraFeedState {
		if (this.live) {
			// Get the size of the video preview so that we can set the image preview to the same dimensions
			let rect = this.video.getBoundingClientRect();
			
			// Take a still frame of the video
			let canvas = document.createElement("canvas");
			canvas.width = this.video.videoWidth;
			canvas.height = this.video.videoHeight;
			
			let ctx = canvas.getContext("2d");
			ctx.drawImage(this.video, 0, 0);
			
			// Convert the canvas to an image
			let img = new Image();
			img.src = canvas.toDataURL("image/png");
			img.onload = ()=>{
				this.point.setValue(img, true);
			}
			
			// Show the image preview
			this.element.innerHTML = "";
			canvas.setAttribute("style", `width:${rect.width}px; height:${rect.height}px;`);
			this.element.appendChild(canvas);
			
			// Stop all of the tracks, ending the camera stream
			this.endStream();
			
			// Update the plug positions
			this.point.getNode().updatePlugPositions();
			
			return CameraFeedState.STILL;
		}
		else {
			// e.g. they pressed the "re-take" button
			
			// Maintain the aspect ratio so the node doesn't "jump"
			let rect = this.element.getBoundingClientRect();
			this.element.style.width  = rect.width  + "px";
			this.element.style.height = (rect.height - 1) + "px";
			
			// Restart the feed
			this.live = true;
			this.startLiveFeed();
			
			return CameraFeedState.LIVE;
		}
	}
	
	/**
	* End the camera stream - e.g. to save resources and turn off the camera light
	*/
	public endStream(): void {
		this.stream.getTracks().forEach((x)=>x.stop());
		this.live = false;
	}
	
	/**
	* Start the live camera feed.
	*/
	private startLiveFeed(): void {
		if (this.live) {
			// Make up the video element where the live feed will be shown
			this.video = document.createElement("video");
			this.video.autoplay = true;
			this.video.width = 300;
			
			// Set the preview to only contain that video element
			this.element.innerHTML = "";
			this.element.appendChild(this.video);
			this.point.getNode().updatePlugPositions();
			
			// Stream the user's webcam into the video element
			navigator.mediaDevices.getUserMedia({video: true}).then((stream)=>{
				this.stream = stream;
				this.video.srcObject = this.stream;
				
				this.video.onplaying = ()=>{
					// This might trigger a resize, so update the wires just in case
					this.point.getNode().updatePlugPositions();
				}
			});
		}
	}
	
}

/**
* An enum representing whether the node is showing a live preview feed or a selected still image.
*/
export enum CameraFeedState {
	LIVE,
	STILL
}