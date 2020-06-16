/**
* @classdesc This class serves two purposes:
*   * It keeps track of the names, descriptions, paths and constructors of all `@register`ed classes.
*   * It can use this information to display a dialog where the user browse node classes, and add one to the document.
* @author Orlando
*/
class NodeDatabase {
	
	// Each element should be in the form
	//     {name: string, description: string, path: string[], constructor: Function}
	private db: Object[] = [];
	
	constructor() {
		// Build the database, using the array of classes found by @register
		for (let candidate of registry) {
			
			// Make an instance of the candidate
			let clazz = new (<any>candidate)();
			
			// Check that it is a NodeElement
			if (clazz instanceof NodeElement) {
				// If it is, add the required object to the database
				this.db.push({
					name:        clazz.getName(),
					description: clazz.getDescription(),
					path:        clazz.getPath(),
					constructor: candidate
				});
			}
			else {
				// Notify of bad @register usage rather than just failing silently
				console.warn(`@register should only be used on classes that extend NodeElement! Class "${candidate.name}" either needs to extend NodeElement, or its @register decorator should be removed.`);
			}			
		}
	}
	
}