///<reference path="../NodeImageTransformation.ts" />

/**
 * @classdesc "Hue" shift the colours on an image by a given amount
 * @author Simon, Orlando
 */

@register
class NodeHueShift extends NodeImageTransformation {
	private matrix: number[][];

	constructor() {
		super("Hue Shift", "Shift the colours of an image", "/Effects");

		this.addInlet({
			name: "Amount",
			description: "The amount to rotate the colour space",
			type: new TypeNumber()
		}).build();

		this.matrix = [
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1]
		];
	}

	protected transformation: ImageTransformationFunction = (canvas, ctx, _img) => {
		// Get all of the pixels in the image in the form [R, G, B, A, R, G, B, A, ...]
		let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let pixels = data.data;

		// Get the amount to shift the colours
		let amount = this.inlets[1].getValue() % 360;

		for (let i = 0; i < pixels.length; i += 4) {
			const r = pixels[i];
			const g = pixels[i + 1];
			const b = pixels[i + 2];

			this.set_hue_rotation(amount);

			const rx = this.pixelClamp(r * this.matrix[0][0] + g * this.matrix[0][1] + b * this.matrix[0][2]);
			const gx = this.pixelClamp(r * this.matrix[1][0] + g * this.matrix[1][1] + b * this.matrix[1][2]);
			const bx = this.pixelClamp(r * this.matrix[2][0] + g * this.matrix[2][1] + b * this.matrix[2][2]);

			pixels[i] = rx;
			pixels[i + 1] = gx;
			pixels[i + 2] = bx;
		}

		// Apply the transformations to the canvas
		ctx.putImageData(data, 0, 0);
	};

	private set_hue_rotation(degrees: number) {
		// Source: https://stackoverflow.com/questions/8507885/shift-hue-of-an-rgb-color
		const cosA = Math.cos(this.radians(degrees));
		const sinA = Math.sin(this.radians(degrees));

		this.matrix[0][0] = cosA + (1.0 - cosA) / 3.0;
		this.matrix[0][1] = (1 / 3) * (1.0 - cosA) - Math.sqrt(1 / 3) * sinA;
		this.matrix[0][2] = (1 / 3) * (1.0 - cosA) + Math.sqrt(1 / 3) * sinA;
		this.matrix[1][0] = (1 / 3) * (1.0 - cosA) + Math.sqrt(1 / 3) * sinA;
		this.matrix[1][1] = cosA + (1 / 3) * (1.0 - cosA);
		this.matrix[1][2] = (1 / 3) * (1.0 - cosA) - Math.sqrt(1 / 3) * sinA;
		this.matrix[2][0] = (1 / 3) * (1.0 - cosA) - Math.sqrt(1 / 3) * sinA;
		this.matrix[2][1] = (1 / 3) * (1.0 - cosA) + Math.sqrt(1 / 3) * sinA;
		this.matrix[2][2] = cosA + (1 / 3) * (1.0 - cosA);
	}

	private radians(degrees: number): number {
		return (degrees * Math.PI) / 180;
	}

	private pixelClamp(value: number): number {
		return Math.max(0, Math.min(255, value));
	}
}
