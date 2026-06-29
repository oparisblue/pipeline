import { FileNodeElement } from "FileNodeElement";
import { fileFormat, register } from "Registry";
import { TypeImage, TypeNumber } from "types";
import { base64ToBytes } from "utils";

/**
 * @classdesc Rasterize a dropped SVG to a bitmap image at a chosen size.
 * @author Simon
 */
@register
@fileFormat(null, ["image/svg+xml"], ["svg"])
export class NodeSVG extends FileNodeElement {
  // The raw SVG markup of the dropped file
  private source: string = null;

  // Intrinsic size parsed from the SVG, used to drive "0 = auto" scaling
  private intrinsicWidth: number = 0;
  private intrinsicHeight: number = 0;

  private statusUI: HTMLElement;

  constructor() {
    super();

    this.statusUI = document.createElement("div");

    this.setProperties({
      name: "SVG",
      description: "Rasterize an SVG to an image at a chosen size",
      help:
        `Loads a dropped SVG and rasterizes it to a bitmap, which can then be ` +
        `wired into other image nodes or downloaded as PNG/JPEG.<br><br>` +
        `Width and Height set the output size; the SVG scales cleanly to fit. ` +
        `Leave a dimension at 0 to derive it from the SVG's aspect ratio ` +
        `(both 0 uses the SVG's own size).`
    })
      .addInlet({
        name: "Width",
        description: "Output width in pixels (0 = derive from aspect ratio)",
        type: new TypeNumber(0)
      })
      .addInlet({
        name: "Height",
        description: "Output height in pixels (0 = derive from aspect ratio)",
        type: new TypeNumber(0)
      })
      .addOutlet({
        name: "Image",
        description: "The rasterized image",
        type: new TypeImage()
      })
      .setPreview(this.outlets[0])
      .setBottomUI(this.statusUI)
      .build();
  }

  public loadFile(base64: string, _contentType: string[]): void {
    this.source = new TextDecoder().decode(base64ToBytes(base64));
    this.readIntrinsicSize();
    this.update();
  }

  protected apply(resolve: Function, _reject: Function): void {
    if (this.source == null) {
      this.outlets[0].setValue(null);
      resolve();
      return;
    }

    let [width, height] = this.resolveSize();

    // Bake the target size into the markup so the vector rasterizes crisply at that
    // size, rather than being scaled up from its default size (blurry, esp. Firefox)
    let sized = this.applySize(width, height);

    let img = new Image();

    img.onload = () => {
      try {
        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);

        // Re-encode as PNG so downstream nodes get a plain bitmap
        let out = new Image();
        out.onload = () => {
          this.setStatus(`${width} &times; ${height}`);
          this.outlets[0].setValue(out);
          resolve();
        };
        out.src = canvas.toDataURL("image/png");
      } catch (_e) {
        // toDataURL throws if the SVG pulled in external resources (tainted canvas)
        this.setStatus(
          `<span style="color: #f44336;">Could not rasterize this SVG (it may reference external resources).</span>`
        );
        this.outlets[0].setValue(null);
        resolve();
      }
    };

    img.onerror = () => {
      this.setStatus(
        `<span style="color: #f44336;">This SVG could not be loaded.</span>`
      );
      this.outlets[0].setValue(null);
      resolve();
    };

    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(sized);
  }

  /**
   * Apply the "0 = auto" rules to the Width/Height inlets, returning the final
   * pixel dimensions to rasterize at.
   */
  private resolveSize(): [number, number] {
    let w = Math.round(this.inlets[0].getValue());
    let h = Math.round(this.inlets[1].getValue());

    let aspect = this.intrinsicWidth / this.intrinsicHeight;

    if (w <= 0 && h <= 0) {
      w = this.intrinsicWidth;
      h = this.intrinsicHeight;
    } else if (w <= 0) {
      w = Math.round(h * aspect);
    } else if (h <= 0) {
      h = Math.round(w / aspect);
    }

    return [Math.max(1, w), Math.max(1, h)];
  }

  /**
   * Re-serialize the SVG with explicit width/height (and a viewBox, if missing, so
   * the content scales to the new size rather than being clipped).
   */
  private applySize(width: number, height: number): string {
    let root = this.parseRoot();
    if (root == null) return this.source;

    if (root.getAttribute("viewBox") == null)
      root.setAttribute(
        "viewBox",
        `0 0 ${this.intrinsicWidth} ${this.intrinsicHeight}`
      );

    root.setAttribute("width", String(width));
    root.setAttribute("height", String(height));

    return new XMLSerializer().serializeToString(root);
  }

  /**
   * Read the SVG's intrinsic size from its width/height attributes, falling back to
   * the viewBox, then to the SVG replaced-element default (300 x 150).
   */
  private readIntrinsicSize(): void {
    this.intrinsicWidth = 0;
    this.intrinsicHeight = 0;

    let root = this.parseRoot();
    if (root == null) return;

    let w = this.parseLength(root.getAttribute("width"));
    let h = this.parseLength(root.getAttribute("height"));

    if (w == 0 || h == 0) {
      let viewBox = root.getAttribute("viewBox");
      if (viewBox != null) {
        let parts = viewBox
          .trim()
          .split(/[\s,]+/)
          .map(Number);
        if (parts.length == 4) {
          if (w == 0) w = parts[2];
          if (h == 0) h = parts[3];
        }
      }
    }

    this.intrinsicWidth = w || 300;
    this.intrinsicHeight = h || 150;
  }

  private parseRoot(): Element | null {
    let doc = new DOMParser().parseFromString(this.source, "image/svg+xml");
    if (doc.querySelector("parsererror") != null) return null;
    return doc.documentElement;
  }

  /**
   * Parse a CSS length like "100" or "100px" to a number. Percentages give no
   * absolute size, so they are treated as unknown (0).
   */
  private parseLength(value: string | null): number {
    if (value == null || value.indexOf("%") > -1) return 0;
    let n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  }

  private setStatus(message: string): void {
    this.statusUI.innerHTML =
      message == "" ? "" : `<div class="noResults">${message}</div>`;
  }
}
