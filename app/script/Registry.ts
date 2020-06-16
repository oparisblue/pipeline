// Stores all of the registered constructors.
// This will be processed in the main Pipeline script once thw window has loaded.
let registry: Function[];

/**
* Class Decorator.<br>
* Any class which extends NodeElement and which has this decorator will be registered.
* This means that it will be available to users in the search UI, etc, without any extra effort from your end.
*/
function register(constructor: Function) {
	// It is entirely possible that this decorator method will be called before the registry definition - 
	// this function is called when the class definition is found, not when the window is done loading!
	// Therefore, it makes more sense to set its initial value here than above.
	if (registry == undefined) registry = [];
	
	// Add the constructor to the registered constructors list.
	registry.push(constructor);
}