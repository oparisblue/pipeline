import { ConnectionManager } from "./ConnectionManager";
import { NodeDatabase } from "./NodeDatabase";
import { NodeElement } from "./NodeElement";
import { UploadManager } from "./UploadManager";

// Import everything so that they get included in the build,
// as esbuild optimises away classes that are only recognised
// by decorators.
import * as Downloaders from "./downloaders";
import * as Previews from "./previews";
import * as Nodes from "./nodes";
import * as types from "./types";

function nop(_item: any) {}

nop(Downloaders);
nop(Previews);
nop(Nodes);
nop(types);

export class Pipeline {
  public main: HTMLElement;
  public connections: ConnectionManager;
  public nodeDatabase: NodeDatabase;
  public uploadManager: UploadManager;

  public toAdd: any = Nodes.NodeAdd;

  public draggingNode: NodeElement = null;

  private mouseX: number;
  private mouseY: number;

  // Pan accumulated from wheel gestures, waiting to be applied
  private panX: number = 0;
  private panY: number = 0;
  private panFrame: number = null;

  private nodes: NodeElement[] = [];

  constructor() {
    this.main = $("#main");

    this.connections = new ConnectionManager();
    this.nodeDatabase = new NodeDatabase();
    this.uploadManager = new UploadManager();

    // Double-Click to add nodes
    this.main.ondblclick = (event) => {
      this.showAddNodeGUI(event);
    };

    // Track mouse position
    window.onmousemove = (event: MouseEvent) => {
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;

      // Drag the current node (if any)
      if (this.draggingNode != null) {
        this.draggingNode.getElement().style.left =
          this.mouseX - this.draggingNode.dragOffsetX + "px";
        this.draggingNode.getElement().style.top =
          this.mouseY - this.draggingNode.dragOffsetY + "px";
        this.draggingNode.updatePlugPositions();
      }
    };

    // Perform various cleanup tasks when the mouse is released
    // (Note that releasing the mouse over a plug cancels the event, so this would not be fired in that case)
    window.onmouseup = (event: MouseEvent) => {
      // Stop dragging any node
      this.draggingNode = null;

      // Close the add node GUI
      this.nodeDatabase.close();

      // End any currently drawn line, and bring up the add node GUI in its place
      if (this.connections.isDrawingLine()) {
        // End the line
        this.connections.endLine();

        // Show the add node GUI
        this.showAddNodeGUI(event);
      }
    };

    // Scroll to pan
    window.addEventListener(
      "wheel",
      (event: WheelEvent) => {
        // Let scrollable UI (e.g. the add node list) scroll itself
        if ((<HTMLElement>event.target).closest(".nodeListings")) return;

        // Stop the browser's own gestures: rubber-banding, swipe-to-navigate, pinch zoom
        event.preventDefault();

        // Pinch-to-zoom arrives as ctrl + wheel; zooming isn't supported yet
        if (event.ctrlKey) return;

        // The add node UI is anchored to the canvas, so don't pan out from under it
        if (this.nodeDatabase.isOpen()) return;

        this.queuePan(event);
      },
      { passive: false }
    );

    // Prevent right-click
    window.oncontextmenu = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    // Drag-and-drop to create nodes from files
    ["dragenter", "dragover", "dragleave", "drop"].forEach((type) => {
      window.addEventListener(
        type,
        (event: DragEvent) => {
          this.uploadManager.handleDrag(
            <"dragenter" | "dragover" | "dragleave" | "drop">type,
            event
          );
        },
        false
      );
    });
  }

  /**
   * Accumulate a wheel gesture, to be applied on the next frame.
   * @param {WheelEvent} event The gesture to add.
   */
  private queuePan(event: WheelEvent): void {
    // Trackpads report pixels, but wheels report lines or pages
    const scale =
      event.deltaMode == WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode == WheelEvent.DOM_DELTA_PAGE
          ? window.innerHeight
          : 1;

    // The canvas follows the fingers, so it moves against the scroll direction
    this.panX -= event.deltaX * scale;
    this.panY -= event.deltaY * scale;

    if (this.panFrame == null) {
      this.panFrame = window.requestAnimationFrame(() => this.applyPan());
    }
  }

  /**
   * Move every node by the pan accumulated since the last frame.
   */
  private applyPan(): void {
    this.panFrame = null;

    const panX = this.panX;
    const panY = this.panY;
    this.panX = 0;
    this.panY = 0;

    // Read every position and size up-front, so reads and writes aren't interleaved
    const moved = this.nodes.map((node) => {
      const element = node.getElement();
      return {
        node,
        element,
        left: parseFloat(element.style.left) + panX,
        top: parseFloat(element.style.top) + panY,
        width: element.offsetWidth,
        height: element.offsetHeight
      };
    });

    let topCheck = false;
    let leftCheck = false;
    let bottomCheck = false;
    let rightCheck = false;

    for (const item of moved) {
      if (item.top + item.height < 0) topCheck = true;
      if (item.left + item.width < 0) leftCheck = true;
      if (item.left > window.innerWidth) rightCheck = true;
      if (item.top > window.innerHeight) bottomCheck = true;

      item.element.style.left = item.left + "px";
      item.element.style.top = item.top + "px";
    }

    for (const item of moved) item.node.updatePlugPositions();

    $("#indicator-top").style.display = topCheck ? "block" : "none";
    $("#indicator-right").style.display = rightCheck ? "block" : "none";
    $("#indicator-bottom").style.display = bottomCheck ? "block" : "none";
    $("#indicator-left").style.display = leftCheck ? "block" : "none";
  }

  private showAddNodeGUI(event: MouseEvent): void {
    // Ensure we only capture double-clicks on the background, not on other nodes
    if (event.srcElement == this.main) {
      //this.addNode(new this.toAdd(event.clientX, event.clientY));
      this.nodeDatabase.addNodeUI();
      this.updateState();
    }
  }

  public updateState(): void {
    // Hide and show the helper text
    $("#helperText").style.display =
      this.main.childElementCount == 0 ? "block" : "none";
  }

  /**
   * Add a node to the document, and closes the add node dialog
   * @param {any} constructor A constructor for a NodeElement.
   * @param {number} x The X position of the node's top-left corner.
   * @param {number} y The Y position of the node's top-left corner.
   * @return {NodeElement} The node that was added.
   */
  public addNode(constructor: any, x: number, y: number): NodeElement {
    // Create an instance of the node
    let node: NodeElement = new constructor();

    // Add the node
    this.addNodeFromInstance(node, x, y);

    return node;
  }

  /**
   * Add a node that has already been instantiated.
   * @param {NodeElement} node The node to add.
   * @param {number} x The X position of the node's top-left corner.
   * @param {number} y The Y position of the node's top-left corner.
   */
  public addNodeFromInstance(node: NodeElement, x: number, y: number): void {
    this.nodes.push(node);

    // Add the node's element to the page, at the current mouse position
    let element: HTMLElement = node.getElement();
    element.style.left = x + "px";
    element.style.top = y + "px";
    this.main.appendChild(element);

    // Run the preview function for the node
    node.setupPreview();

    // Update the page, and close the add node dialog
    this.updateState();
    this.nodeDatabase.close();
    node.updatePlugPositions();
  }

  /**
   * Get the current X position of the mouse.
   */
  public getMouseX(): number {
    return this.mouseX;
  }

  /**
   * Get the current Y position of the mouse.
   */
  public getMouseY(): number {
    return this.mouseY;
  }
}

export let application: Pipeline;

window.onload = () => {
  application = new Pipeline();
};

function querySelector(selector: string): HTMLElement {
  return document.querySelector(selector);
}

// See global.d.ts for type definition / export
(window as any).$ = querySelector;
