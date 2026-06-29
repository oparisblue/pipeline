/**
 * Convert raw bytes into a base64 string.
 * Works in chunks, as calling String.fromCharCode with an entire multi-megabyte array
 * overflows the argument limit, while appending one character at a time is far too slow.
 */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  let chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

/**
 * Convert a base64 string back into raw bytes.
 */
export function base64ToBytes(base64: string): Uint8Array {
  let binary = atob(base64);
  let bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}
