/**
* @classdesc To be used in places where another type cannot be worked out. You probably want {@link TypeAny} instead.
* @author Orlando
*/
class TypeUnknown extends DataType {
	
	public cast(other: any): any {
		return other;
	}
	
    public defaultValue(): any {
        return null;
    }
	
	public getHexColour(): string {
        return "#FFC107";
    }
	
	public getName(): string {
        return "Anything";
    }
	
	public makeControl(_point: ConnectionPoint, _disabled: boolean): HTMLElement {
        return document.createElement("span");
    }
	
}