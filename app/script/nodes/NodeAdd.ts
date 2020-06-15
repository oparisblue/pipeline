/**
* Takes in two numbers, and adds them together.
*/
class NodeAdd extends NodeElement {
	
	constructor(x: number, y: number) {
        super("Add", "Add two numbers together.", x, y);
		
		this.inlets = [
			new ConnectionPoint("X", "The number on the left-hand side.", new TypeNumber(), this),
			new ConnectionPoint("Y", "The number on the right-hand side.", new TypeNumber(), this)
		];
		
		this.outlets = [
			new ConnectionPoint("Result", "The result of X + Y.", new TypeNumber(), this)
		];
		
		this.preview = new PreviewConnectionPoint(this.outlets[0]);
		
		this.build();
    }
	
	protected apply(): Promise<void> {
	    return new Promise<void>((resolve)=>{
			// Add the two inlet values together, and set the outlet as this result
			this.outlets[0].setValue(this.inlets[0].getValue() + this.inlets[1].getValue());
			resolve();
		});
    }
	
}