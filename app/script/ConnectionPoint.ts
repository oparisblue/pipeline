class ConnectionPoint {
	
	private name: string;
	private description: string;
	private type: DataType;
	private node: NodeElement;
	private link: ConnectionPoint = null;
	
	constructor(name: string, description: string, type: DataType, node: NodeElement) {
		this.name = name;
		this.description = description;
		this.type = type;
		this.node = node;
	}
	
	public getName(): string {
		return this.name;
	}
	
	public getDescription(): string {
		return this.description;
	}
	
	/**
	* Set the value stored in this connection point, casting the type (if possible).
	* @param {any} newValue The new value for the connection point.
	* @param {boolean} updateNode Optional (default `false`). When `true`, this updates the node, when `false` it doesn't.
	* @throws {TypeError} If the attempted cast is not possible.
	*/
	public setValue(newValue: any, updateNode: boolean = false): void {
		// Set the value as stored in the data-type. This throws an error if a valid cast cannot be made.
		this.type.setValue(newValue);
		
		// Update the node
		if (updateNode) this.node.update();
	}
	
	public getValue(): any {
		return this.type.getValue();
	}
	
	public getType(): DataType {
		return this.type;
	}
	
	/**
	* Update the node on the other end of this connection point, if such a link exists.
	*/
	public updateLinkedNode(): void {
		// If there is a connection
		if (this.link != null) {
			// Find the node at the end of the link, and update it.
			this.link.node.update();
		}
	}
	
	public setLinkedNode(link: ConnectionPoint): void {
		this.link = link;
	}
	
}