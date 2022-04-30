import { NodeAdd } from "local/nodes/";
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
	
	public toAdd: any = NodeAdd;
	
	public draggingNode: NodeElement  = null;
	
	private mouseX: number;
	private mouseY: number;
	
	private nodes: NodeElement[] = [];
	
	constructor() {
		this.main = $("#main");
		
		this.connections   = new ConnectionManager();
		this.nodeDatabase  = new NodeDatabase();
		this.uploadManager = new UploadManager();
		
		// Double-Click to add nodes
		this.main.ondblclick = (event) => {
			this.showAddNodeGUI(event);
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
		
		// Perform various cleanup tasks when the mouse is released
		// (Note that releasing the mouse over a plug cancels the event, so this would not be fired in that case)
		window.onmouseup = (event: MouseEvent)=>{
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
		}
		
		// Scroll to pan
		window.onwheel = (event: WheelEvent)=>{
			event.stopPropagation();
		}
		
		// Prevent right-click
		window.oncontextmenu = (event: MouseEvent)=>{
			event.preventDefault();
			event.stopPropagation();
		}
		
		// Drag-and-drop to create nodes from files
		["dragenter", "dragover", "dragleave", "drop"].forEach((type)=>{
			window.addEventListener(type, (event: DragEvent)=>{
				this.uploadManager.handleDrag(<"dragenter" | "dragover" | "dragleave" | "drop">type, event);
			}, false);
		});
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
		$("#helperText").style.display = this.main.childElementCount == 0 ? "block" : "none";
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
		element.style.top  = y + "px";
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

window.onload = ()=>{
	application = new Pipeline();
}

function querySelector(selector: string): HTMLElement {
	return document.querySelector(selector);
}

// See global.d.ts for type defintion / export
(window as any).$ = querySelector;