class Pipeline {
	
	private main: HTMLElement;
	
	private nodes: NodeElement[] = [];
	
	constructor() {
		this.main = $("#main");
		
		// Double-Click to add nodes
		this.main.ondblclick = (event)=>{
			// Ensure we only capture double-clicks on the background, not on other nodes
			if (event.srcElement == this.main) {
				this.addNode(new NodeAdd(event.clientX, event.clientY));
			}
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
	}
	
	public deleteNode(node: NodeElement): void {
		
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