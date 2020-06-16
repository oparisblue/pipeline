class Pipeline {
	
	public main: HTMLElement;
	public connections: ConnectionManager;
	public nodeDatabase: NodeDatabase;
	
	public toAdd: any = NodeAdd;
	
	public draggingNode: NodeElement  = null;
	
	private mouseX: number;
	private mouseY: number;
	
	private nodes: NodeElement[] = [];
	
	constructor() {
		this.main = $("#main");
		
		this.connections = new ConnectionManager();
		
		this.nodeDatabase = new NodeDatabase();
		
		// Double-Click to add nodes
		this.main.ondblclick = (event)=>{
			// Ensure we only capture double-clicks on the background, not on other nodes
			if (event.srcElement == this.main) {
				//this.addNode(new this.toAdd(event.clientX, event.clientY));
				this.nodeDatabase.addNodeUI();
				this.updateState();
			}
		}
		
		// Track mouse position
		window.onmousemove = (event: MouseEvent)=>{
			this.mouseX = event.clientX;
			this.mouseY = event.clientY;
			
			// Drag the current node (if any)
			if (this.draggingNode != null) {
				this.draggingNode.getElement().style.left = (this.mouseX - this.draggingNode.dragOffsetX) + "px";
				this.draggingNode.getElement().style.top  = (this.mouseY - this.draggingNode.dragOffsetY) + "px";
				this.draggingNode.updatePlugPositions();
			}
		}
		
		// Stop drawing a line / dragging a node when the mouse is released
		// (Note that releasing the mouse over a plug cancels the event, so this would not be fired in that case)
		window.onmouseup = ()=>{
			this.connections.endLine();
			this.draggingNode = null;
			
			document.querySelectorAll(".addNode").forEach((x)=>x.remove());
			this.updateState();
		}
		
		// Scroll to pan
		window.onmousewheel = (event)=>{
			event.stopPropagation();
		}
		
		// Prevent right-click
		window.oncontextmenu = (event: MouseEvent)=>{
			event.preventDefault();
			event.stopPropagation();
		}
		
	}
	
	private updateState(): void {
		// Hide and show the helper text
		$("#helperText").style.display = this.main.childElementCount == 0 ? "block" : "none";
	}
	
	public addNode(node: NodeElement): void {
		this.nodes.push(node);
		
		// Add the node's element to the page, at the current mouse position
		let element: HTMLElement = node.getElement();
		element.setAttribute("style", `left: ${this.getMouseX()}px; top: ${this.getMouseY()}px;`);
		this.main.appendChild(element);
		
		this.updateState();
		node.updatePlugPositions();
	}
	
	// public deleteNode(node: NodeElement): void {
	// 	this.updateState();
	// }
	
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

let application: Pipeline;

window.onload = ()=>{
	application = new Pipeline();
}

// Utility methods

function $(selector: string): HTMLElement {
	return document.querySelector(selector);
}

/**
* Iterate through a TypeScript enum.
* @yields The next value in the enum - e.g. 0, 1, etc
*/
function* iterateEnum(enumerable: any) {
	for (let i in enumerable) {
		if (isNaN(parseFloat(i))) yield enumerable[i];
	}
}