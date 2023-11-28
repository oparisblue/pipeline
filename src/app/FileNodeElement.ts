import { NodeElement } from './NodeElement';

/**
 * @classdesc
 * Nodes which can be created via file upload should extend this class.
 * Nodes which extend this class automatically do not appear in the add node GUI - e.g. you do not need to call `hideInAddGUI()`.
 * @author Orlando
 */
export abstract class FileNodeElement extends NodeElement {
  constructor() {
    super();
    this.appearsInAddGUI = false;
  }

  /**
   * Load a file into the node from base64 format.
   * @param {string} base64 The base64 file data.
   * @param {string} contentType The type of the file, e.g. "image/png". This can be null, depending on how it is set in the `@fileFormat` annotation.
   */
  public abstract loadFile(base64: string, contentType: string[]): void;
}
