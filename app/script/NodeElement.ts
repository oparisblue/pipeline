/**
* A node represents one of the nodes which make up the pipeline graph.
*/
abstract class NodeElement {
	
	public inlets: ConnectionPoint[];
	public outlets: ConnectionPoint[];
	
	public dragOffsetX: number;
	public dragOffsetY: number;
	
	protected readonly name: string;
	protected readonly description: string;

	protected preview: Preview;
	
	protected element: HTMLElement;
	
	private x: number;
	private y: number;

	constructor(name: string, description: string, x: number, y: number) {
		this.name        = name;
		this.description = description;
		this.x           = x;
		this.y           = y;
	}
	
	/**
	* Called whenever one of the inlets changes. Should re-apply the operation specified by this node.
	* @return {Promise<void>} A promise, which resolves once the re-application is complete.
	*/
	protected abstract apply(): Promise<void>
	
	/**
	* Mark the node as complete, creating its element and running the setup functions.
	*/
	protected build(): void {
		
		// Assign sides to the connection points
		this.inlets.forEach((x)=>{x.side = IOSide.Input});
		this.outlets.forEach((x)=>{x.side = IOSide.Output});		
		
		// Main node
		this.element = document.createElement("div");
		this.element.classList.add("node");
		this.element.setAttribute("style", `left: ${this.x}px; top: ${this.y}px;`);
		
		// Title bar
		let title = document.createElement("div");
		title.classList.add("title");
		title.innerHTML = this.name;
		title.onmousedown = ()=>{
			// Start dragging the node
			let rect = title.getBoundingClientRect();
			this.dragOffsetX = application.getMouseX() - rect.left;
			this.dragOffsetY = application.getMouseY() - rect.top;
			application.draggingNode = this;
		}
		this.element.appendChild(title);
		
		// Preview pane
		let previewPane = document.createElement("div")
		previewPane.classList.add("preview");
		this.preview.setup(previewPane);
		this.preview.render();
		this.element.appendChild(previewPane);
		
		// Inlets & Outlets panes
		let patchboard = document.createElement("table");
		
		let points: ConnectionPoint[][] = [this.inlets, this.outlets];
		
		// Loop through the sides (input and output)
		for (let side of iterateEnum(IOSide)) {
			
			// Loop through all of the connection points for each side
			for (let point of points[side]) {
				let empty = document.createElement("td");
				
				// The plug that the user can use to wire an input to another node
				let plugColumn = document.createElement("td");
				let plug = document.createElement("div");
				plug.classList.add("plug");
				plug.style.borderColor = point.getType().getActualHexColour();
				plug.addEventListener("mousedown", ()=>{
					application.connections.makeConnection(point);
				});
				plug.addEventListener("mouseup", ()=>{
					application.connections.makeConnection(point);
				});
				plugColumn.appendChild(plug);
				
				// The label for the field
				let label = document.createElement("td")
				label.title = point.getDescription();
				label.innerText = point.getName() + ":";
				
				// The field which can be used to edit the input manually
				let control = document.createElement("td");
				control.appendChild(point.getType().makeControl(point, side == IOSide.Output)); // Disable editing if this is an output field
				
				// Add everything into a row, and add that to the table
				// Ensures that the plug is on the left side for input, and the right side for output
				let row = document.createElement("tr");
				row.appendChild(side == IOSide.Input ? plugColumn : empty);
				row.appendChild(label);
				row.appendChild(control);
				row.appendChild(side == IOSide.Output ? plugColumn : empty);
				patchboard.appendChild(row);
			}
			
			// Add a divider between the two sides
			if (side == IOSide.Input) {
				let divider = document.createElement("tr");
				divider.innerHTML = `<td colspan="4"><div class="divider"></div></td>`;
				patchboard.appendChild(divider);
			}
		}
		
		this.element.appendChild(patchboard);
	}
	
	/**
	* Update the X and Y positions of the plugs in this node, so that lines between them are drawn correctly.
	*/
	public updatePlugPositions(): void {
		let points: ConnectionPoint[][] = [this.inlets, this.outlets];
		
		let plugs = this.element.querySelectorAll(".plug");
		
		// Loop through the sides (input and output)
		for (let i = 0; i < points.length; i++) {
			// Loop through all of the connection points for each side
			for (let j = 0; j < points[i].length; j++) {
				// Get the current point
				let point = points[i][j];
				// Get the computed style for the plug representing this point in the node element
				let rect = plugs[(i * points[0].length) + j].getBoundingClientRect();
				// Update the X and Y coords accordingly
				point.x = rect.left + (rect.width / 2);
				point.y = rect.top - (rect.height * 1.5);
			}
		}
	}
	
	/**
	* Re-calculate the value of this node, and then update the preview and the nodes that come after this one.
	*/
	public update(updateInlets: boolean = false): void {
		this.apply().then(()=>{
			// Update the preview image
			this.preview.render();
			
			// Update the inlets if requested
			if (updateInlets) {
				for (let inlet of this.inlets) {
					inlet.getType().updateControl(inlet.hasLink(), inlet.getValue());
				}
			}
			
			// Update all of the nodes that come after this one
			for (let outlet of this.outlets) {
				outlet.updateLinkedNode();
				outlet.getType().updateControl(true, outlet.getValue());
			}
		}).catch(()=>{});
	}
	
	public getElement(): HTMLElement {
		return this.element;
	}
	
}