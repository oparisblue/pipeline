class Pipeline {
	
	public main: HTMLElement;
	public connections: ConnectionManager;
	
	public toAdd: any = NodeAdd;
	
	private mouseX: number;
	private mouseY: number;
	
	private nodes: NodeElement[] = [];
	
	constructor() {
		this.main = $("#main");
		
		this.connections = new ConnectionManager();
		
		// Double-Click to add nodes
		this.main.ondblclick = (event)=>{
			// Ensure we only capture double-clicks on the background, not on other nodes
			if (event.srcElement == this.main) {
				this.addNode(new this.toAdd(event.clientX, event.clientY));
			}
		}
		
		// Track mouse position
		window.onmousemove = (event: MouseEvent)=>{
			this.mouseX = event.clientX;
			this.mouseY = event.clientY;
		}
		
		// Scroll to pan
		window.onmousewheel = (event)=>{
			event.stopPropagation();
		}
		
	}
	
	private updateState(): void {
		// Hide and show the helper text
		$("#helperText").style.display = this.nodes.length == 0 ? "block" : "none";
	}
	
	public addNode(node: NodeElement): void {
		this.nodes.push(node);
		this.main.appendChild(node.getElement());
		this.updateState();
		node.updatePlugPositions();
	}
	
	// public deleteNode(node: NodeElement): void {
	// 
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