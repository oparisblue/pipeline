/**
* @classdesc This class serves two purposes:
*   * It keeps track of the names, descriptions, paths and constructors of all `@register`ed classes.
*   * It can use this information to display a dialog where the user browse node classes, and add one to the document.
* @author Orlando
*/
class NodeDatabase {
	
	// Database objects are in the form
	//     {name: string, description: string, path: string[], constructor: Function}
	// There are two lookup methods: a lookup by category, and a lookup by name. Both return references to the same object.
	
	// e.g. [{...}, {...}]
	private db: Object[] = [];
	
	// e.g. {"Math": {"Basic": {"_nodes": [...]}, "_nodes": [...]}, "Util": {"_nodes": [...]}, "_nodes": [...]}
	private dbByCategory: Object = {"_nodes": []};
	
	constructor() {
		// Build the database, using the array of classes found by @register
		for (let candidate of registry) {
			
			// Make an instance of the candidate
			let clazz = new (<any>candidate)();
			
			// Check that it is a NodeElement
			if (clazz instanceof NodeElement) {
				// Create the database object
				let obj = {
					name:        clazz.getName(),
					description: clazz.getDescription(),
					path:        clazz.getPath(),
					constructor: candidate
				};
				
				// Add it to the simple representation
				this.db.push(obj);
				
				// Add it to the categorical representation
				let currentLevel = this.dbByCategory;
				for (let i = 0; i < obj.path.length; i++) {
					// If this category does not yet exist, add it
					if (!(obj.path[i] in currentLevel)) {
						let newLevel = {"_nodes": []};
						currentLevel[obj.path[i]] = newLevel;
						currentLevel = newLevel;
					}
					// Otherwise, use the level that already exists
					else {
						currentLevel = currentLevel[obj.path[i]];
					}
					
					// If this is the last level in the path, then add the object at this point
					if (i == obj.path.length - 1) currentLevel["_nodes"].push(obj);
				}
			}
			else {
				// Notify of bad @register usage rather than just failing silently
				console.warn(`@register should only be used on classes that extend NodeElement! Class "${candidate.name}" either needs to extend NodeElement, or its @register decorator should be removed.`);
			}			
		}
	}
	
	/**
	* Display the add node UI at the mouse pointer.
	* From here, the user can search and browse categories of nodes.
	*/
	public addNodeUI(): void {
		
		let element = document.createElement("div");
		element.style.left = application.getMouseX() + "px";
		element.style.top  = application.getMouseY() + "px";
		element.classList.add("addNode")
		
		// Search box
		let searchContainer = document.createElement("div");
		searchContainer.classList.add("search");
		let search = document.createElement("input");
		search.type = "text";
		search.placeholder = "Add Node...";
		searchContainer.appendChild(search);
		element.appendChild(searchContainer);
		
		// Category Header
		let categoryHeader = document.createElement("div");
		categoryHeader.classList.add("categoryHeader");
		element.appendChild(categoryHeader);
		
		// Node Listings
		let listings = document.createElement("div");
		listings.classList.add("nodeListings");
		this.showNodeGroup([], categoryHeader, listings);
		element.appendChild(listings);
		
		application.main.appendChild(element);
		
		search.focus();
		
	}
	
	/**
	* Show the table of sub-groups and nodes for a given level.
	* @param {string[]} path The path to the category to show listings for, e.g. ["Math", "Basic"] to represent "Math/Basic".
	* @param {HTMLElement} listings The GUI area to add the nodes into
	*/
	private showNodeGroup(path: string[], categoryHeader: HTMLElement, listings: HTMLElement): void {
		// Clear the previous listings and header (if any)
		listings.innerHTML       = "";
		categoryHeader.innerHTML = "";
		
		// If we are not at the root level, add a button to go back to the previous level to the header
		if (path.length > 0) {
			let backButton = document.createElement("i");
			backButton.setAttribute("class", "mdi mdi-chevron-left");
			backButton.onclick = ()=>{
				// Go back to the previous category
				this.showNodeGroup(path.slice(0, -1), categoryHeader, listings);
			}
			categoryHeader.appendChild(backButton);
		}
		
		// Add the category heading text
		let title = document.createElement("span");
		title.innerHTML = path.length == 0 ? "All Nodes" : path[path.length - 1];
		categoryHeader.appendChild(title);
		
		// Get all of the categories at the level specified by the path, as well as the special "_nodes" item
		let items = path.reduce((acc, val)=>acc[val], this.dbByCategory);
		
		// Get the keys in alphabetical order
		let itemKeys = Object.keys(items).sort();
		
		// Get all of the nodes in alphabetical order
		let nodes = items["_nodes"].sort((a: Object, b: Object)=>{
			let aName: string = a["name"];
			let bName: string = b["name"];
			return aName == bName ? 0 : (aName < bName ? -1 : 1);
		});
		
		// Add the category items
		for (let key of itemKeys) {
			if (key == "_nodes") continue; // Skip the special "_nodes" item
			let row = this.createNodeListing(key, "", true);
			
			// Go one level deeper when clicking on a category
			row.onclick = ()=>{
				this.showNodeGroup([...path, key], categoryHeader, listings);
			};
			
			listings.appendChild(row);
		}
		
		// Add the nodes
		for (let node of nodes) {
			listings.appendChild(this.createNodeListing(node["name"], node["description"], false));
		}
	}
	
	/**
	* Create a single row in the node listings.
	* @param {string} name The name of the row.
	* @param {string} description The short description of the row, shown when the user hovers their mouse over it.
	* @param {boolean} category `true` if this is a category.
	* This affects behaviour (e.g. clicking a node adds the node, clicking a category scrolls to that level in the UI)
	* and the interface generated (categories get an arrow drawn on the right-hand side of their row)
	*/
	private createNodeListing(name: string, description: string, isCategory: boolean): HTMLElement {
		let result: HTMLElement = document.createElement("div");
		result.classList.add("nodeListing");
		result.innerHTML = name + (isCategory ? `<i class="mdi mdi-chevron-right"></i>` : ``);
		result.title = description;
		return result;
	}
	
}