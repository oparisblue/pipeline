/**
* @classdesc Takes in two numbers, and adds them together.
* @author Orlando
*/
@register
class NodeAdd extends NodeElement {
	
	constructor() {
		super();
		
		this
			.setProperties ({name: "Add",    description: "Add two numbers together",          path: "Maths/Basic"})
			.addInlet      ({name: "X",      description: "The number on the left-hand side",  type: new TypeNumber()})
			.addInlet      ({name: "Y",      description: "The number on the right-hand side", type: new TypeNumber()})
			.addOutlet     ({name: "Result", description: "The result of X + Y",               type: new TypeNumber()})
			.setPreview    (new PreviewConnectionPoint(this.outlets[0]))
			.build();
    }
	
	protected apply(resolve: Function, _reject: Function): void {
		// Add the two inlet values together, and set the outlet as this result
		this.outlets[0].setValue(this.inlets[0].getValue() + this.inlets[1].getValue());
		resolve();
    }
	
}