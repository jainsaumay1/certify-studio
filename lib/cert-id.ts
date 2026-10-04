/**
 * Generates a high-entropy, human-readable certificate ID.
 * Format: EKC-YYYY-XXXXXX (6 alphanumeric chars, uppercase)
 */
export function generateCertId(year?: number): string {
  const y = year ?? new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I,O,0,1 to avoid confusion
  let suffix = "";
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  for (const byte of array) {
    suffix += chars[byte % chars.length];
  }
  return `EKC-${y}-${suffix}`;
}

/**
 * Returns the current year for use in cert IDs.
 */
export function currentYear(): number {
  return new Date().getFullYear();
}
