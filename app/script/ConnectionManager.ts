/**
* @classdesc Draws the lines between nodes, keeps track of parameters when new lines are being created, and provides controls for deleting lines.
* @author Orlando
*/
class ConnectionManager {
	
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;
	
	private isDrawing: boolean = false;
	private startingPoint: ConnectionPoint;
	
	private lines: ConnectionPoint[][] = [];
	
	constructor() {
		this.canvas = <HTMLCanvasElement> $("#lines");
		
		// Set the initial size of the canvas
		this.resizeCanvas();
		
		// Resize the canvas when the window is resized
		window.addEventListener("resize", ()=>{
			this.resizeCanvas();
		})
		
		// Find the canvas context
		this.context = this.canvas.getContext("2d");
		
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
			let inlet  = this.startingPoint.side == IOSide.Input  ? this.startingPoint : point;
			let outlet = this.startingPoint.side == IOSide.Output ? this.startingPoint : point;
			
			// If they are e.g. both inlets or both outlets ignore the click
			if (inlet.side != IOSide.Input || outlet.side != IOSide.Output) return;
			
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
	* Stop drawing a connection, either because the user canceled, or because the connection has now been established.
	*/
	public endLine(): void {
		this.isDrawing = false;
	}
	
	/**
	* Draw the connection lines to the canvas.
	*/
	private render(): void {
		// Style settings for the lines
		this.context.lineCap = "round";
		this.context.lineWidth = 3;
		
		let renderFunc = ()=>{
			// Clear the previously drawn lines
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			
			// Draw all of the existing lines
			for (let line of this.lines) {
				// Create a gradient between the two type colours
				// The `createLinearGradient` function takes in (x0, y0, x1, y1) of the gradient, thus specifying its size and slope.
				// We make these values track those of the line.
				let gradient = this.context.createLinearGradient(line[0].x, line[0].y, line[1].x, line[1].y);
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
				this.context.strokeStyle = this.startingPoint.getType().getActualHexColour();
				this.context.beginPath();
				this.context.moveTo(this.startingPoint.x, this.startingPoint.y);
				this.context.lineTo(application.getMouseX(), application.getMouseY() - 25);
				this.context.stroke();
			}
			
			// Render lines again ASAP
			window.requestAnimationFrame(renderFunc);
		}
		
		renderFunc();		
	}
	
}