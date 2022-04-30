import { FileNodeElement } from "./FileNodeElement";
import { application } from "./Pipeline";
import { fileHandlerRegistry } from "./Registry";

/**
* @classdesc Deal with uploading files and creating nodes from them.
* @author Orlando
*/
export class UploadManager {
	
	private dragPreview: HTMLElement;
	
	constructor() {
		this.dragPreview = $("#dragPreview")
	}
	
	/**
	* Show the preview node which follows dragged files, and handle reading in files which are dropped.
	* @param type A string representing the name of the event to handle - e.g. "dragenter", "dragover", "dragleave" or "drop".
	* @param event The event data.
	*/
	handleDrag(type: "dragenter" | "dragover" | "dragleave" | "drop", event: DragEvent): void {
		event.preventDefault();
		event.stopPropagation();
		
		// Show the node preview when the dragging begins
		if (type == "dragenter") {
			this.dragPreview.style.display = "block";
			$("#helperText").style.display = "none";
			application.main.classList.add("preventInteraction");
		}
		
		// Move the node preview as the mouse is moved
		if (type == "dragenter" || type == "dragover") {
			this.dragPreview.style.left = (event.clientX - 103) + "px";
			this.dragPreview.style.top  = (event.clientY - 82)  + "px";
		}
		
		// Hide the node preview if the file has been dragged away or dropped
		else if (type == "dragleave") {
			this.resetDraggingGUI();
		}
		
		// If the file has been dropped, try to make a node for it
		else if (type == "drop") {
			// Get the first file, as we don't support multi-file upload (yet)
			let file = event.dataTransfer.files[0];
			
			let reader = new FileReader();
			reader.onloadend = ()=>{
				
				// Get the bytes in the file
				let bytes: Uint8Array = new Uint8Array(<ArrayBuffer> reader.result);
				
				// Try and identify what type of file we have
				
				// First choice: the magic word at the start of the file - e.g. "2303741511". Impervious to file name changes, etc, but not all formats support it.
				let magicNumber = this.getMagicNumber(bytes);
				
				// The content type, as interpreted by the browser - e.g. "image/png". Can be more accurate than extension checking in some places, but not always.
				let contentType = file.type;
				// As a last resort, check the file extension - e.g. "png". This can easily be fooled, e.g. by renaming a file from ".png" to ".jpg", etc.
				let extension   = file.name.split(".").pop().toLowerCase();
				
				// Now, find a class capable of handling this kind of file
				// We want the highest match of magic number + content type + extension as possible in case there are conflicts
				
				let bestMatch = 0;
				let clazz: Function = null;
				let interpretedContentType: string[];
				
				for (let handler of fileHandlerRegistry) {
					let typeInfo: [number[], string[], string[]] = handler[0];
					
					// Count how many of the type indicators match
					let matches = 0;
					if (typeInfo[0] != null && typeInfo[0].indexOf(magicNumber) > -1) matches++;
					if (typeInfo[1] != null && typeInfo[1].indexOf(contentType) > -1) matches++;
					if (typeInfo[2] != null && typeInfo[2].indexOf(extension)   > -1) matches++;
					
					// If there is at least some match, and it is a better match than our previous one, then we're going to use this class
					if (matches > 0 && matches > bestMatch) {
						bestMatch = matches;
						interpretedContentType = typeInfo[1];
						clazz = handler[1];
					}
				}
				
				// If we have found a class that we can use...
				if (clazz != null) {
					
					let node = new (<any> clazz)();
					
					if (node instanceof FileNodeElement) {
						// Read in the file in Base64
						let base64 = btoa(bytes.reduce((acc, val)=>acc + String.fromCharCode(val), ""));
						
						// Create the node, at the position of the preview element
						let rect = this.dragPreview.getBoundingClientRect();
						application.addNodeFromInstance(node, rect.left, rect.top);
						
						// Load the file into that node
						(<FileNodeElement> node).loadFile(base64, interpretedContentType);
					}
				}
				
				this.resetDraggingGUI();
			}
			reader.readAsArrayBuffer(file);
		}
	}
	
	/**
	* The "magic number" is a unique set of bytes at the beginning of most files which specify their content type.
	* This function finds the magic number for a given file, by getting the first word of the file, converting each byte
	* from binary to a HEX number, and then converting the resulting HEX number to an integer.
	* @see {@link https://en.wikipedia.org/wiki/Magic_number_%28programming%29#In_files}
	* @param {ArrayBuffer} file The file to get the magic number for
	* @return {number} The magic number
	*/
	private getMagicNumber(file: Uint8Array): number {
		return parseInt(file.subarray(0, 4).reduce((acc, val)=>acc + val.toString(16), ""), 16);
	}
	
	/**
	* Reset the dragging GUI when a file is dropped or dragged off-screen.
	*/
	private resetDraggingGUI(): void {
		$("#dragPreview").style.display = "none";
		application.main.classList.remove("preventInteraction");
		application.updateState();
	}
	
	public static asDataURL(base64: string, contentType: string[]): string {
		return `data:${contentType[0]};base64,${base64}`;
	}
	
}