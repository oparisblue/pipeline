import { ConnectionPoint } from "./ConnectionPoint";
import { IOSide } from "./IOSide";
import { NodeElement } from "./NodeElement";
import { application } from "./Pipeline";
import { registry } from "./Registry";

/**
 * @classdesc This class serves two purposes:
 *   * It keeps track of the names, descriptions, paths and constructors of all `@register`ed classes.
 *   * It can use this information to display a dialog where the user browse node classes, and add one to the document.
 * @author Orlando
 */
export class NodeDatabase {
  // Database objects are in the form
  //     {name: string, description: string, path: string[], instance: NodeElement, construct: Function}
  // There are two lookup methods: a lookup by category, and a lookup by name. Both return references to the same object.

  // Every known node, e.g. [{...}, {...}]
  private db: Object[] = [];

  // The nodes the add node UI is currently offering; all of them, unless narrowed by `from`
  private shownDb: Object[] = [];

  // `shownDb` by category, e.g. {"Math": {"Basic": {"_nodes": [...]}, "_nodes": [...]}, "Util": {"_nodes": [...]}, "_nodes": [...]}
  private dbByCategory: Object = { _nodes: [] };

  // The plug a line was dragged off from, which the added node should be wired up to
  private from: ConnectionPoint = null;

  constructor() {
    // Build the database, using the array of classes found by @register
    for (let candidate of registry) {
      // Make an instance of the candidate
      let clazz = new (<any>candidate)();

      // Check that it is a NodeElement
      if (clazz instanceof NodeElement) {
        // Ensure that it should be added to the database before proceeding
        if (!clazz.isNodeAddable()) continue;

        // Create the database object. The instance is kept so that the plugs the node
        // declares can be inspected without having to make another one.
        this.db.push({
          name: clazz.getName(),
          description: clazz.getDescription(),
          path: clazz.getPath(),
          instance: clazz,
          construct: candidate
        });
      } else {
        // Notify of bad @register usage rather than just failing silently
        console.warn(
          `@register should only be used on classes that extend NodeElement! Class "${candidate.name}" either needs to extend NodeElement, or its @register decorator should be removed.`
        );
      }
    }
  }

  /**
   * Build the categorical representation of a list of nodes.
   * @param {Object[]} nodes The nodes to include.
   * @return {Object} e.g. {"Math": {"Basic": {"_nodes": [...]}, "_nodes": [...]}, "_nodes": [...]}
   */
  private buildCategoryTree(nodes: Object[]): Object {
    let tree = { _nodes: [] };

    for (let node of nodes) {
      let path: string[] = node["path"];
      let currentLevel = tree;

      for (let i = 0; i < path.length; i++) {
        // Add this category if it does not yet exist, then step into it
        if (!(path[i] in currentLevel)) currentLevel[path[i]] = { _nodes: [] };
        currentLevel = currentLevel[path[i]];

        // If this is the last level in the path, then add the node at this point
        if (i == path.length - 1) currentLevel["_nodes"].push(node);
      }
    }

    return tree;
  }

  /**
   * Find the first free plug on a node that a given plug could be wired to.
   * @param {NodeElement} node The node to search.
   * @param {ConnectionPoint} from The plug to connect to.
   * @return {ConnectionPoint} The plug found, or `null` if the node has none.
   */
  private findPointFor(
    node: NodeElement,
    from: ConnectionPoint
  ): ConnectionPoint {
    // A line from an outlet needs an inlet to land in, and vice versa
    let points = from.side == IOSide.Output ? node.inlets : node.outlets;

    return (
      points.find(
        (point) =>
          !point.hasLink() && point.getType().canConnectTo(from.getType())
      ) || null
    );
  }

  /**
   * Display the add node UI at the mouse pointer.
   * From here, the user can search and browse categories of nodes.
   * @param {ConnectionPoint} from Optional. The plug a line was dragged off from. When given, only
   * nodes that can be wired to it are offered, and the node that gets added is connected to it.
   */
  public addNodeUI(from: ConnectionPoint = null): void {
    this.from = from;

    // Narrow the listings down to the nodes the dragged-off line can actually connect to
    this.shownDb =
      from == null
        ? this.db
        : this.db.filter((x) => this.findPointFor(x["instance"], from) != null);
    this.dbByCategory = this.buildCategoryTree(this.shownDb);

    let element = document.createElement("div");
    element.style.left = application.getMouseX() + "px";
    element.style.top = application.getMouseY() + "px";
    element.classList.add("addNode");

    // Prevent clicking on the element from firing the dismiss event
    element.onmouseup = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };

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

    // Apply searches
    search.oninput = () => {
      if (search.value == "") {
        // Revert to category view when the search box is empty
        this.showNodeGroup([], categoryHeader, listings);
      } else {
        // Get all of the matching nodes, and sort them
        let filteredNodes = this.sortNodeList(
          this.shownDb.filter((x) =>
            x["name"].toLowerCase().includes(search.value.toLowerCase())
          )
        );

        // Clear the current contents of the panel, and show a message if there are no results
        listings.innerHTML =
          filteredNodes.length == 0
            ? `<div class="noResults">No results!</div>`
            : "";

        // Show a back button in the header that takes us back to category view and clears the search box
        categoryHeader.innerHTML = "";
        let backButton = document.createElement("i");
        backButton.setAttribute("class", "mdi mdi-chevron-left");
        backButton.onclick = () => {
          this.showNodeGroup([], categoryHeader, listings);
          search.value = "";
        };
        categoryHeader.appendChild(backButton);
        let title = document.createElement("span");
        title.innerHTML = "Search Results";
        categoryHeader.appendChild(title);

        // Add all of the matching nodes to the panel
        for (let node of filteredNodes) {
          listings.appendChild(
            this.createNodeListing(
              node["name"],
              node["description"],
              false,
              () => {
                this.addNode(node);
              }
            )
          );
        }
      }
    };

    // Add the first node in the search results when the Enter key is pressed.
    search.onkeyup = (event: KeyboardEvent) => {
      if (event.key == "Enter" && search.value != "") {
        let firstElement = listings.firstElementChild;
        // If there are actually results...
        if (!firstElement.classList.contains("noResults")) {
          // ... click the element to add the node
          (<HTMLElement>firstElement).click();
        }
      }
      // Close the add GUI when the escape key is pressed
      else if (event.key == "Escape") {
        this.close();
      }
    };

    search.focus();
  }

  /**
   * @return `true` if an add node GUI is currently showing.
   */
  public isOpen(): boolean {
    return $(".addNode") != null;
  }

  /**
   * Close all open add node GUIs.
   */
  public close(): void {
    document.querySelectorAll(".addNode").forEach((x) => x.remove());
    this.from = null;
    application.updateState();
  }

  /**
   * Show the table of sub-groups and nodes for a given level.
   * @param {string[]} path The path to the category to show listings for, e.g. ["Math", "Basic"] to represent "Math/Basic".
   * @param {HTMLElement} listings The GUI area to add the nodes into
   */
  private showNodeGroup(
    path: string[],
    categoryHeader: HTMLElement,
    listings: HTMLElement
  ): void {
    // Clear the previous listings and header (if any)
    listings.innerHTML = "";
    categoryHeader.innerHTML = "";

    // If we are not at the root level, add a button to go back to the previous level to the header
    if (path.length > 0) {
      let backButton = document.createElement("i");
      backButton.setAttribute("class", "mdi mdi-chevron-left");
      backButton.onclick = () => {
        // Go back to the previous category
        this.showNodeGroup(path.slice(0, -1), categoryHeader, listings);
      };
      categoryHeader.appendChild(backButton);
    }

    // Add the category heading text, calling out the type being connected to (if any)
    let title = document.createElement("span");
    title.innerHTML =
      path.length > 0
        ? path[path.length - 1]
        : this.from == null
          ? "All Nodes"
          : `${this.from.getType().getName()} Nodes`;
    categoryHeader.appendChild(title);

    // Get all of the categories at the level specified by the path, as well as the special "_nodes" item
    let items = path.reduce((acc, val) => acc[val], this.dbByCategory);

    // Get the keys in alphabetical order
    let itemKeys = Object.keys(items).sort();

    // Get all of the nodes in alphabetical order
    let nodes = this.sortNodeList(items["_nodes"]);

    // Add the category items
    for (let key of itemKeys) {
      if (key == "_nodes") continue; // Skip the special "_nodes" item
      let row = this.createNodeListing(key, "", true, () => {
        // Go one level deeper when clicking on a category
        this.showNodeGroup([...path, key], categoryHeader, listings);
      });

      listings.appendChild(row);
    }

    // Add the nodes
    for (let node of nodes) {
      listings.appendChild(
        this.createNodeListing(node["name"], node["description"], false, () => {
          this.addNode(node);
        })
      );
    }

    // Nothing to show, e.g. when no node can connect to the plug the line was dragged off
    if (listings.childElementCount == 0)
      listings.innerHTML = `<div class="noResults">No results!</div>`;
  }

  /**
   * Create a single row in the node listings.
   * @param {string} name The name of the row.
   * @param {string} description The short description of the row, shown when the user hovers their mouse over it.
   * @param {boolean} category `true` if this is a category.
   * @param {any} clickFunction The function to call when the node is clicked.
   * This affects behaviour (e.g. clicking a node adds the node, clicking a category scrolls to that level in the UI)
   * and the interface generated (categories get an arrow drawn on the right-hand side of their row)
   */
  private createNodeListing(
    name: string,
    description: string,
    isCategory: boolean,
    clickFunction: any
  ): HTMLElement {
    let result: HTMLElement = document.createElement("div");
    result.classList.add("nodeListing");
    result.innerHTML =
      name + (isCategory ? `<i class="mdi mdi-chevron-right"></i>` : ``);
    result.title = description;
    result.onclick = clickFunction;

    return result;
  }

  /**
   * Sort a list of nodes so that they are in alphabetical order
   * @param {Object[]} nodes The unsorted list
   * @return {Object[]} The sorted list
   */
  private sortNodeList(nodes: Object[]): Object[] {
    return nodes.sort((a: Object, b: Object) => {
      let aName: string = a["name"];
      let bName: string = b["name"];
      return aName == bName ? 0 : aName < bName ? -1 : 1;
    });
  }

  private addNode(node: Object): void {
    // Position the node in the same place as the add node GUI
    let rect = $(".addNode").getBoundingClientRect();

    // Hold on to the plug to wire up, as adding the node closes the UI (which clears it)
    let from = this.from;

    let added = application.addNode(node["construct"], rect.left, rect.top);

    if (from == null) return;

    // Wire the dragged-off line into the first plug of the new node that can take it
    let point = this.findPointFor(added, from);

    if (point == null) return;

    if (from.side == IOSide.Output)
      application.connections.connect(from, point);
    else application.connections.connect(point, from);
  }
}
