/**
 * Utilities for converting between degrees and radians
 * @author Simon, Orlando
 */

export function degrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function radians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
