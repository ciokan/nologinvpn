/**
 * Generates a cryptographically random access key.
 * Format: 4 groups of 8 hex chars separated by dashes
 * Example: a3f5b2c1-9e4d7f80-2b1c3a4e-5f6d7890
 */
export function generateAccessKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 16)}-${hex.slice(16, 24)}-${hex.slice(24, 32)}`;
}
