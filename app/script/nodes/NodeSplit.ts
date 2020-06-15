/**
* Takes in something of any type, produces two exact copies of it
*/
class NodeSplit extends NodeElement {
	
	constructor(x: number, y: number) {
        super("Split", "Splits one input into two identical output.", x, y);
		
		this.inlets = [
			new ConnectionPoint("Input", "Something to clone.", new TypeAny(), this)
		];
		
		this.outlets = [
			new ConnectionPoint("Clone 1", "A clone of Input.", new TypeAny(), this),
			new ConnectionPoint("Clone 2", "A clone of Input.", new TypeAny(), this)
		];
		
		this.preview = new PreviewConnectionPoint(this.inlets[0]);
		
		this.build();
    }
	
	protected apply(): Promise<void> {
	    return new Promise<void>((resolve)=>{
			// Find the type of the inlet - the outlets' type should match it!
			let type: DataType = (<TypeAny> this.inlets[0].getType()).getOtherType();
			
			console.log(type);
			
			// Just create two clones of the input
			this.outlets[0].setValue(this.inlets[0].getValue(), false, false, type);
			this.outlets[1].setValue(this.inlets[0].getValue(), false, false, type);
			resolve();
		});
    }
	
}