import { Downloader } from "./Downloader";

// Stores all of the registered constructors.

// This will be processed in the main Pipeline script once the window has loaded.
export let registry: Function[];

// Much like the registry, but for file handlers
export let fileHandlerRegistry: [[number[], string[], string[]], Function][];

// Must like the registry, but for downloaders
export let downloaders: Downloader[];

/**
 * Class Decorator.
 *
 * Any class which extends NodeElement and which has this decorator will be registered.
 * This means that it will be available to users in the search UI, etc, without any extra effort from your end.
 */
export function register(constructor: Function) {
  // It is entirely possible that this decorator method will be called before the registry definition -
  // this function is called when the class definition is found, not when the window is done loading!
  // Therefore, it makes more sense to set its initial value here than above.
  if (registry == undefined) registry = [];

  // Add the constructor to the registered constructors list.
  registry.push(constructor);
}

/**
 * Class Decorator.
 *
 * Classes which have this decorator will be registered as handlers for uploaded files - e.g. their node will be created
 * when a file that matches the type specified in the decorator is uploaded.
 * These classes should also extend FileNodeElement.
 * Each of the parameters can either have a value, or be null, depending on whether they are relevant.
 * @param {number[]} magicNumbers An array of magic numbers which represent this file type - e.g. [0x89504E47]
 * @param {string[]} contentType  A string representing the content type - e.g. ["image/png"]
 * @param {string[]} extension    The file extension - e.g. ["png"]
 */
export function fileFormat(
  magicNumbers: number[],
  contentType: string[],
  extension: string[]
) {
  return (constructor: Function) => {
    // This works exactly the same as the register annotation above
    if (fileHandlerRegistry == undefined) fileHandlerRegistry = [];
    // e.g. [[0x89504E47, "image/png", "png"], NodeImage...]
    fileHandlerRegistry.push([
      [magicNumbers, contentType, extension],
      constructor
    ]);
  };
}

/**
 * Class Decorator.
 *
 * Register a strategy which can be used to download specific types of data.
 */
export function downloadStrategy(constructor: Function) {
  // As in @register
  if (downloaders == undefined) downloaders = [];

  // Construct an instance of the class
  downloaders.push(new (<any>constructor)());
}
