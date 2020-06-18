/**
* @classdesc Download strings and numbers, etc, as text files
* @author Orlando
*/
@downloadStrategy
class DownloaderText extends Downloader {
	
    public canAccept(data: any): boolean {
        return typeof data == "string" || typeof data == "number";
    }
	
    public download(data: any): void {
		// Download the text
        this.downloadDataURL("data:text/plain;charset=UTF-8," + encodeURIComponent(data));
    }
	
	public getExtension(): string {
        return ".TXT";
    }
	
}