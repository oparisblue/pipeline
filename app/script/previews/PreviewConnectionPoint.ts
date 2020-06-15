class PreviewConnectionPoint implements Preview {
	
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
    }
	
}