import { NodeElement } from "local/NodeElement";
import { downloaders, register } from "local/Registry";
import { TypeAny } from "local/types/TypeAny";

/**
* @classdesc Download the result from a previous node.
* @author Orlando
*/
@register
export class NodeDownload extends NodeElement {
	
	private downloadUI: HTMLElement;
	
	constructor() {
		super();
		
		this.downloadUI = document.createElement("div");
		
		this
			.setProperties ({name: "Download", description: "Download the result from a previous node", path: "Utility"})
			.addInlet      ({name: "Input",    description: "Something to download",                    type: new TypeAny()})
			.setPreview    (this.inlets[0])
			.setBottomUI   (this.downloadUI)
			.build();
			
		this.updateDownloadUI();
    }
	
	protected apply(resolve: Function, _reject: Function): void {
		this.updateDownloadUI();
		
		resolve();
    }
	
	private updateDownloadUI(): void {
		// Clear the current list of download strategies
		this.downloadUI.innerHTML = "";
		
		let currentValue = this.inlets[0].getValue();
		
		// Check each avaialble download strategy to see if it can download our new data
		for (let downloader of downloaders) {
			if (downloader.canAccept(currentValue)) {
				// Create a button that the user can click to download the data as a file
				let downloadButton = document.createElement("button");
				downloadButton.classList.add("downloadButton");
				downloadButton.innerHTML = `<i class="mdi mdi-download"></i> ${downloader.getExtension()}`;
				downloadButton.onclick = ()=>{
					downloader.download(currentValue);
				}
				// Add the button to the list
				this.downloadUI.appendChild(downloadButton);
			}
		}
		
		// If no strategies were found (e.g. the UI is still empty), show the "No results" message
		if (this.downloadUI.innerHTML == "") {
			this.downloadUI.innerHTML = `<div class="noResults">No Download Methods</div>`;
		}
	}
	
}