/**
* Utilities for converting between colour models
* @author Orlando
*/
export class ColourUtil {
	
	/**
	* Convert an RGB colour to an HSL colour
	*/
	static RGBtoHSL(r: number, g: number, b: number): [number, number, number] {
		// R, G, and B now range between 0 and 1
		r /= 255; g /= 255; b /= 255;
		
		// Find the smallest and largest channels, and the difference between them
		let cmin  = Math.min(r, g, b);
		let cmax  = Math.max(r, g, b);
		let delta = cmax - cmin;
		
		// Find the hue
		let h = 0;
		
		if (delta != 0) {
			if      (cmax == r) h = ((g - b) / delta) % 6;
			else if (cmax == g) h = ((b - r) / delta) + 2;
			else if (cmax == b) h = ((r - g) / delta) + 4;
		}
		
		h = Math.round(h * 60);
		if (h < 0) h += 360;
		
		// Find the saturation and lightness
		let l = (cmax + cmin) / 2;
		let s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		
		l *= 100; s *= 100;
		
		return [h, s, l];	
	}
	
}