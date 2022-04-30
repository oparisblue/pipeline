import { ConnectionPoint } from "local/ConnectionPoint";
import { Preview } from "local/Preview";

/**
* @classdesc Basic preview strategy. Simply uses the type-defined preview in a connection point.
* @author Orlando
*/
export class PreviewConnectionPoint implements Preview {
	
	private point: ConnectionPoint;
	private element: HTMLElement;
	
	constructor(point: ConnectionPoint) {
		this.point = point;
	}
	
    setup(element: HTMLElement): void {
		this.element = element;
		this.point.getType().doPreviewSetup(element);
    }
	
    render(): void {
        this.point.getType().doPreviewRender(this.element);
		this.point.getNode().updatePlugPositions();
    }
	
}