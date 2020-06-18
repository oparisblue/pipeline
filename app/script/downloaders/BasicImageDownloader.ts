/**
* @classdesc An abstract downloader that's capable of downloading basic kinds of images - e.g. those supported in canvas out-of-the-box
* @author Orlando
*/
abstract class DownloaderImages extends Downloader {
	
    public canAccept(data: any): boolean {
        return data instanceof Image;
    }
	
    public download(data: any): void {
		// Cast the data as an image (we can assume canAccept is always called first)
		let img = (<HTMLImageElement> data);
		
		// Make a canvas with the image on it
		let canvas = document.createElement("canvas");
		canvas.width  = img.width;
		canvas.height = img.height;
		let ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0);
		
		// Download the image
        this.downloadDataURL(canvas.toDataURL("image/" + this.getExtension().slice(1).toLowerCase()));
    }
	
}

// Implementations of this class - e.g. for PNG and JPEG, etc

@downloadStrategy
class DownloaderPNG extends DownloaderImages {
	public getExtension():string { return ".PNG"; }
}

@downloadStrategy
class DownloaderJPEG extends DownloaderImages {
	public getExtension():string { return ".JPEG"; }
}