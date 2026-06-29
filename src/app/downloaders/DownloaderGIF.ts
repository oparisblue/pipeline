import { Downloader } from "Downloader";
import { downloadStrategy } from "Registry";

/**
 * @classdesc Downloads animated GIFs. GIFs flow through the graph as image elements whose
 * src is a GIF data URL, and this downloader saves those original encoded bytes directly.
 * The basic image downloaders would accept these images too, but they redraw through a
 * canvas - which would flatten the animation down to its first frame.
 * @author Simon
 */
@downloadStrategy
export class DownloaderGIF extends Downloader {
  public canAccept(data: any): boolean {
    return data instanceof Image && data.src.startsWith("data:image/gif");
  }

  public download(data: any): void {
    // The data URL already contains the encoded GIF - download it as-is
    this.downloadDataURL((<HTMLImageElement>data).src);
  }

  public getExtension(): string {
    return ".GIF";
  }
}
