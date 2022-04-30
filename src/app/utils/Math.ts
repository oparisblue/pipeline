/**
 * Extra math util functions
 * @author Simon, Orlando
 */

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}