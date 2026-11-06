// Returns true for empty values and for valid http/https URLs.
// Blocks things like "javascript:alert(1)" or "ftp://...".
export function isHttpUrl(value) {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}