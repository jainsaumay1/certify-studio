/**
 * Computes a SHA-256 digest of the given ArrayBuffer using the WebCrypto API.
 * Returns the digest as a lowercase hex string.
 */
export async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Computes SHA-256 of a UTF-8 string.
 */
export async function sha256String(text: string): Promise<string> {
  const encoder = new TextEncoder();
  return sha256Hex(encoder.encode(text).buffer as ArrayBuffer);
}
