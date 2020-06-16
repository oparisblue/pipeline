/**
* @classdesc A node represents one of the nodes which make up the pipeline graph.
* @author Orlando
*/
abstract class NodeElement {
	
	public inlets:  ConnectionPoint[] = [];
	public outlets: ConnectionPoint[] = [];
	
	public dragOffsetX: number;
	public dragOffsetY: number;
	
	protected name: string = "";
	protected description: string = "No summary available.";
	protected help: string = "No help available.";
	protected path: string[] = ["Misc"];

	protected preview: Preview;
	
	protected element: HTMLElement;
	
	// Builder design pattern for creating new node types, e.g.
	//     this.setProperties({name: "Add", description: "Add two numbers together", path: "Math/Basic"}).addInlet(...).addInlet(...).addOutlet(...).build();
	
	/**
	* Set up the basic details for the node.
	* @param {any} properties A JSON object that can contain:
	*   * `name`: a string which represents the name of the node. This is shown when searching for the node, and at the top of each instance of it.
	*   * `description`: a string which discusses what the node does. Shown when the user hovers over the node when searching, or in the summary section of its help.
	*   * `help`: a string (which can contain HTML) of detailed help for this node. Shown when the user clicks its help button.
	*   * `path`: a string like "Math/Basic", representing the category path the user must traverse to find the node in the search widget.
	* @return {NodeElement} The current node, so that you can chain configuration functions.
	*/
	public setProperties(properties: any): NodeElement {
		if ("name" in properties)
			this.name = properties.name;
		
		if ("description" in properties)
			this.description = properties.description;
			
		if ("help" in properties)
			this.help = properties.help;
		
		// Remove the trailing slash (if any), and then split by slashes - e.g. "Math/Basic/" => ["Math", "Basic"]
		if ("path" in properties)
			this.path = (properties.path || "Misc").replace(/\/$/, "").split("/");
		
		return this;
	}
	
	/**
	* Add an inlet to the node's definition.
	* @param {any} properties A JSON object that must contain:
	*   * `name`: the name of the inlet, as shown on the node UI
	*   * `type`: a new instance of a {@link DataType} object like TypeNumber, TypeString, etc.
	*
	* Optionally, it can also contain:
	*   * `description`: a description of what the inlet does, shown when hovering over the inlet and in the help screen for the node.
	*
	* @return {NodeElement} The current node, so that you can chain configuration functions.
	*/
	public addInlet(properties: any): NodeElement {
		this.inlets.push(new ConnectionPoint(properties.name, properties.description || "", properties.type, this));
		return this;
	}
	
	/**
	* Add an outlet to the node's definition.
	* @param {any} properties A JSON object that must contain:
	*   * `name`: the name of the outlet, as shown on the node UI
	*   * `type`: a new instance of a {@link DataType} object like TypeNumber, TypeString, etc.
	*
	* Optionally, it can also contain:
	*   * `description`: a description of what the outlet does, shown when hovering over the outlet and in the help screen for the node.
	*
	* @return {NodeElement} The current node, so that you can chain configuration functions.
	*/
	public addOutlet(properties: any): NodeElement {
		this.outlets.push(new ConnectionPoint(properties.name, properties.description || "", properties.type, this));
		return this;
	}
	
	/**
	* Set the preview strategy that this node should use.
	* @param {Preview} preview The preview strategy.
	* @return {NodeElement} The current node, so that you can chain configuration functions.
	*/
	public setPreview(preview: Preview): NodeElement {
		this.preview = preview;
		return this;
	}
	
	/**
	* Mark the node as complete, creating its element and running the setup functions.
	* @throws {InvalidStateError} If the name of the node has not been set via e.g. `setProperties`.
	*/
	public build(): void {
		
		// Ensure that the node has a name
		if (this.name == "") {
			throw new Error("All nodes must declare a name!");
		}
		
		// Assign sides to the connection points
		this.inlets.forEach((x)=>{x.side = IOSide.Input});
		this.outlets.forEach((x)=>{x.side = IOSide.Output});		
		
		// Main node
		this.element = document.createElement("div");
		this.element.classList.add("node");
		
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
				point.x = rect.left + (rect.width  / 2);
				point.y = rect.top - 1;
			}
		}
	}
	
	/**
	* Called whenever one of the inlets changes. Should re-apply the operation specified by this node.
	* @param {Function} resolve Call when the application is successful.
	* @param {Function} reject Call when the application is unsuccessful.
	*/
	protected abstract apply(resolve: Function, reject: Function): void
	
	/**
	* Re-calculate the value of this node, and then update the preview and the nodes that come after this one.
	*/
	public update(updateInlets: boolean = false): void {
		new Promise<void>((resolve, reject)=>{
			this.apply(resolve, reject);
		}).then(()=>{
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
	
	// Getters
	
	public getName(): string {
		return this.name;
	}
	
	public getDescription(): string {
		return this.description;
	}
	
	public getHelp(): string {
		return this.help;
	}
	
	public getPath(): string[] {
		return this.path;
	}
	
}