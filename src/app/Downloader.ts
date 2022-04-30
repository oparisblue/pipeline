/**
* @classdesc Represents a strategy for downloading data.
* @author Orlando
*/
export abstract class Downloader {
	
	/**
	* Is this downloader able to download the given variable?
	*/
	public abstract canAccept(data: any): boolean;
	
	/**
	* Download the given variable to the user's disk.
	*/
	public abstract download(data: any): void;
	
	/**
	* Get the extension that the file will have, in upper case, and including the "." character at the beginning.
	*/
	public abstract getExtension(): string;
	
	protected downloadDataURL(dataURL: string) {
		let link = document.createElement("a");
		// Set the file name and attempt to force a download
		link.download = "download" + this.getExtension();
		// Set the path of the link to be the data URL representing the file
		link.href = dataURL;
		// Ensure we don't replace the current tab
		link.target = "_blank";
		// Simulate a mouse click on the link, opening it and thus downloading the file
		link.click();
	}
	
}