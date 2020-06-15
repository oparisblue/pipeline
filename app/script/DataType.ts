/**
* Creates a new instance of the data type. If a value is not provided, then the type's default value is used
* instead.
* @param 
* @classdesc Represents a data type. Every variable of that type is represented as a new instance of this class.
* It provides methods for casting, editing and interacting with the stored representation.
* @author Orlando
*/
abstract class DataType {
	
	/**
	* The value represented by the data type.
	* This should always be interacted with via .getValue() / .setValue(), to protect the
	* invarient that it is always of the correct data type.
	*/
	private value: any;
	
	protected control: HTMLElement;
	
	constructor(initialValue: any = null) {
		this.value = initialValue == null ? this.defaultValue() : this.cast(initialValue);
	}
	
	/**
	* Attempt to cast a value of another type to this type.
	* @throws {TypeError} If the attempted cast is not possible.
	* @return The casted value.
	*/
	abstract cast(other: any): any;
	
	/**
	* @return The default value for this data type.
	*/
	abstract defaultValue(): any;
	
	/**
	* @return A HEX colour code used on the wires and plugs of this type - e.g. `#00ff00` (hash should be included in the output)
	*/
	abstract getHexColour(): string;
	
	/**
	* Make an HTML control which can be used to display / input values of this type.
	*/
	abstract makeControl(point: ConnectionPoint, disabled: boolean): HTMLElement;
	
	/**
	* Update the disabled state / value of the data type's control.
	*/
	abstract updateControl(disabled: boolean, value: any): void;
	
	/**
	* Render a preview of this data type to be shown at the top of the node.
	*/
	abstract doPreviewRender(element: HTMLElement): void;
	
	
	/**
	* Checks if it is possible to cast from another data type to this one.
	* @return {boolean} `true` if a cast is possible, `false` if it is not.
	*/
	public canCast(other: DataType): boolean {
		try {
			this.cast(other.getValue());
			return true;
		}
		catch (e) {
			return false;
		}
	}
	
	/**
	* Get the current value stored in this data type.
	*/
	public getValue(): any {
		return this.value;
	}
	
	/**
	* Update the value of this data type.
	* @param newValue The new value to store. If it is not of this type, then a cast will be attempted.
	* @throws {TypeError} If the attempted cast is not possible.
	*/
	public setValue(newValue: any): void {
		this.value = this.cast(newValue);
	}
	
	/**
	* Perform one-off setup tasks for the preview rendered at the top of the node.
	*/
	public doPreviewSetup(_element: HTMLElement): void {}
	
}