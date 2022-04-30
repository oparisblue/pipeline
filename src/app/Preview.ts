/**
* A preview provides a strategy for rendering the preview images displayed at the top of each node.
*/
export interface Preview {
	
	/**
	* Perform any of the necessary modifications to the HTML required to add the preview.
	* This method is called when the node is first created.
	* @param {HTMLElement} element The div which should contain the preview.
	*/
	setup(element: HTMLElement): void;
	
	/**
	* Re-render the preview. This method is called whenever the node's input changes.
	*/
	render(): void;
	
}