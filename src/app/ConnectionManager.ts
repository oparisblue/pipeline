import { ConnectionPoint } from './ConnectionPoint';
import { IOSide } from './IOSide';
import { NodeElement } from './NodeElement';
import { application } from './Pipeline';

/**
 * @classdesc Draws the lines between nodes, keeps track of parameters when new lines are being created, and provides controls for deleting lines.
 * @author Orlando
 */
export class ConnectionManager {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private isDrawing: boolean = false;
  private startingPoint: ConnectionPoint;

  private lines: ConnectionPoint[][] = [];

  constructor() {
    this.canvas = <HTMLCanvasElement>$('#lines');

    // Find the canvas context
    this.context = this.canvas.getContext('2d');

    // Set the initial size of the canvas
    this.resizeCanvas();

    // Resize the canvas when the window is resized
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });

    // Start the render loop
    this.render();
  }

  /**
   * Resize the canvas by setting its internal width and height to be the same as the width and height assigned to it by CSS.
   */
  private resizeCanvas(): void {
    let rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    // Style settings for the lines
    this.context.lineCap = 'round';
    this.context.lineWidth = 3;
  }

  /**
   * Start or finish making a connection between two nodes.
   * @param point A point that will be part of the connection.
   */
  public makeConnection(point: ConnectionPoint): void {
    // Ignore the click if this point is already connected to another.
    if (point.hasLink()) return;

    // If we are already drawing a connection from one plug, clicking another will connect the two!
    if (this.isDrawing) {
      // Ignore the click if it's from the same node as the point we started from
      if (this.startingPoint.getNode() == point.getNode()) return;

      // Find the inlet and the outlet
      let inlet =
        this.startingPoint.side == IOSide.Input ? this.startingPoint : point;
      let outlet =
        this.startingPoint.side == IOSide.Output ? this.startingPoint : point;

      // If they are e.g. both inlets or both outlets ignore the click
      if (inlet.side != IOSide.Input || outlet.side != IOSide.Output) return;

      // Check that there is no circular link
      if (this.checkCircularLink(outlet.getNode(), inlet.getNode())) return;

      // Ensure there won't be a type error
      let typeError = true;

      try {
        // Ensure that we can cast in both directions - if this produces an error then we can't make the connection
        inlet.getType().cast(outlet.getType().getValue());
        outlet.getType().cast(inlet.getType().getValue());

        // Only runs if the preceding statement doesn't error
        typeError = false;
      } catch (e) {}

      if (typeError) return;

      // Stop drawing the line to the mouse cursor
      this.isDrawing = false;

      // Create the bi-directional relationship
      outlet.setLinkedNode(inlet);
      inlet.setLinkedNode(outlet);

      // Update the node belonging to the inlet
      outlet.updateLinkedNode();

      // Add this line to the set that needs to be tracked
      this.lines.push([inlet, outlet]);
    }
    // Otherwise, if we are not currently drawing a connection, start drawing one from this plug
    else {
      this.isDrawing = true;
      this.startingPoint = point;
    }
  }

  /**
   * Recursively check if adding a connection would create a circular link which would crash the program.
   * Works backwards, from outlets to inlets, until either a circular link is found, or all nodes have been checked.
   * @param currentElement The current element to check.
   * @param proposedTarget The element which cannot appear in any previous links.
   * @param startingPoint If true, the current node is the starting point, so the check can be skipped.
   */
  private checkCircularLink(
    currentElement: NodeElement,
    proposedTarget: NodeElement
  ): boolean {
    // If the current node is the element to avoid, then this is a circular link
    if (currentElement == proposedTarget) return true;

    // Otherwise, test all of our inlets
    for (let inlet of currentElement.inlets) {
      let linkedNode = inlet.getLinkedNode();

      // Only investigate if there is a wire
      if (linkedNode == null) continue;

      // If that node is a circular link, return true
      if (this.checkCircularLink(linkedNode.getNode(), proposedTarget))
        return true;
    }

    // Otherwise, all of the inlets are clear, there is no circular link (at least in this branch)
    return false;
  }

  /**
   * Stop drawing a connection, either because the user canceled, or because the connection has now been established.
   */
  public endLine(): void {
    this.isDrawing = false;
  }

  /**
   * Draw the connection lines to the canvas.
   */
  private render(): void {
    let renderFunc = () => {
      // Clear the previously drawn lines
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw all of the existing lines
      for (let line of this.lines) {
        // Create a gradient between the two type colours
        // The `createLinearGradient` function takes in (x0, y0, x1, y1) of the gradient, thus specifying its size and slope.
        // We make these values track those of the line.
        let gradient = this.context.createLinearGradient(
          line[0].x,
          line[0].y,
          line[1].x,
          line[1].y
        );
        gradient.addColorStop(0, line[0].getType().getActualHexColour());
        gradient.addColorStop(1, line[1].getType().getActualHexColour());

        // Draw the line between the two points
        this.context.strokeStyle = gradient;
        this.context.beginPath();
        this.context.moveTo(line[0].x, line[0].y);
        this.context.lineTo(line[1].x, line[1].y);
        this.context.stroke();
      }

      // If we are currently adding a new line, draw from the saved starting point to the current mouse position
      if (this.isDrawing) {
        this.context.strokeStyle = this.startingPoint
          .getType()
          .getActualHexColour();
        this.context.beginPath();
        this.context.moveTo(this.startingPoint.x, this.startingPoint.y);
        this.context.lineTo(application.getMouseX(), application.getMouseY());
        this.context.stroke();
      }

      // Render lines again ASAP
      window.requestAnimationFrame(renderFunc);
    };

    renderFunc();
  }

  /**
   * @return `true` if the user is currently dragging out a connection line.
   */
  public isDrawingLine(): boolean {
    return this.isDrawing;
  }

  /**
   * Remove any line associated with the given point from the renderer.
   * @param {ConnectionPoint} node The node to remove lines for.
   */
  public removeLine(node: ConnectionPoint): void {
    for (let i = this.lines.length - 1; i >= 0; i--) {
      if (this.lines[i][0] == node || this.lines[i][1] == node) {
        this.lines.splice(i, 1);
      }
    }
  }
}
