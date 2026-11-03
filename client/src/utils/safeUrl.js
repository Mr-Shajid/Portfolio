// Only allow http and https links. Anything else (for example
// "javascript:..." or empty text) is treated as "no link".
export function isSafeUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}