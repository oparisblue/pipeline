/**
 * The value held by a TypeVideo. The same video is kept in two representations: the
 * element is used for previewing and frame extraction, while the blob holds the original
 * container bytes for engines (like ffmpeg) which operate on the file itself.
 */
export interface VideoValue {
  element: HTMLVideoElement;
  blob: Blob;
}
